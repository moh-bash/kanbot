import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Pencil, Play, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import type { Sprint } from "../../types/api";
import { ApiError, fieldErrors } from "../../api/client";
import {
  useCompleteSprint,
  useCreateSprint,
  useDeleteSprint,
  useSprints,
  useStartSprint,
  useUpdateSprint,
} from "../../hooks/useSprints";
import { useGenerateSprintSummary } from "../../hooks/useAI";
import { useToastStore } from "../../components/toast-store";

const sprintSchema = z
  .object({
    name: z.string().trim().max(80, "Name is too long"),
    goal: z.string().max(300, "Goal is too long"),
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    (value) =>
      !value.startDate || !value.endDate || value.endDate >= value.startDate,
    {
      message: "End date must not be earlier than start date",
      path: ["endDate"],
    },
  );
type SprintValues = z.infer<typeof sprintSchema>;

const modalClass =
  "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4";
const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-border bg-input px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/20";

export function CreateSprintDialog({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const mutation = useCreateSprint(projectId);
  const sprintsQuery = useSprints(projectId);
  const addToast = useToastStore((state) => state.addToast);
  const form = useForm<SprintValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: { name: "", goal: "", startDate: "", endDate: "" },
  });
  useEffect(() => {
    if (sprintsQuery.data?.sprints && !form.getValues("name")) {
      form.setValue("name", nextSprintName(sprintsQuery.data.sprints), {
        shouldDirty: false,
      });
    }
  }, [form, sprintsQuery.data?.sprints]);
  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        name: values.name.trim() || undefined,
        goal: values.goal.trim() || undefined,
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      });
      addToast("Sprint created successfully.");
      onClose();
    } catch (error) {
      applyErrors(error, form);
    }
  });
  return (
    <Modal title="Create sprint" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <SprintFields form={form} />
        <DialogActions
          pending={mutation.isPending}
          onCancel={onClose}
          label="Create sprint"
        />
      </form>
    </Modal>
  );
}

function nextSprintName(sprints: Sprint[]) {
  const usedNames = new Set(
    sprints.map((sprint) => sprint.name.trim().toLowerCase()),
  );
  const highestNumber = sprints.reduce((highest, sprint) => {
    const match = /^sprint\s+(\d+)$/i.exec(sprint.name.trim());
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  let number = highestNumber + 1;
  while (usedNames.has(`sprint ${number}`)) number += 1;
  return `Sprint ${number}`;
}

export function EditSprintDialog({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
}) {
  const mutation = useUpdateSprint(projectId);
  const addToast = useToastStore((state) => state.addToast);
  const form = useForm<SprintValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate ?? "",
      endDate: sprint.endDate ?? "",
    },
  });
  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        sprintId: sprint.id,
        body: {
          name: values.name.trim() || undefined,
          goal: values.goal.trim() || undefined,
          startDate: values.startDate || null,
          endDate: values.endDate || null,
        },
      });
      addToast("Sprint updated successfully.");
      onClose();
    } catch (error) {
      applyErrors(error, form);
    }
  });
  return (
    <Modal title="Edit sprint" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <SprintFields form={form} />
        <DialogActions
          pending={mutation.isPending}
          onCancel={onClose}
          label="Save changes"
        />
      </form>
    </Modal>
  );
}

export function DeleteSprintDialog({
  projectId,
  sprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
}) {
  const mutation = useDeleteSprint(projectId);
  const addToast = useToastStore((state) => state.addToast);
  const submit = async () => {
    try {
      await mutation.mutateAsync(sprint.id);
      addToast("Sprint deleted. Its todos are back in the backlog.");
      onClose();
    } catch (error) {
      addToast(
        error instanceof ApiError
          ? error.message
          : "Unable to delete this sprint.",
        "error",
      );
    }
  };
  return (
    <Modal title={`Delete ${sprint.name}?`} onClose={onClose}>
      <p className="text-sm leading-6 text-muted-foreground">
        This will permanently delete the planned sprint. Its todos will be moved
        back to the project backlog.
      </p>
      <DialogActions
        pending={mutation.isPending}
        onCancel={onClose}
        onConfirm={submit}
        label="Delete sprint"
        destructive
      />
    </Modal>
  );
}

export function StartSprintDialog({
  projectId,
  sprint,
  hasActiveSprint,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  hasActiveSprint: boolean;
  onClose: () => void;
}) {
  const mutation = useStartSprint(projectId);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [defaults] = useState(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 14);
    return {
      startDate: sprint.startDate ?? today.toISOString().slice(0, 10),
      endDate: sprint.endDate ?? end.toISOString().slice(0, 10),
    };
  });
  const form = useForm<SprintValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: { name: "", goal: "", ...defaults },
  });
  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({ sprintId: sprint.id, body: values });
      addToast("Sprint started.");
      onClose();
      navigate(`/projects/${projectId}/board`);
    } catch (error) {
      addToast(
        error instanceof ApiError
          ? error.message
          : "Unable to start this sprint.",
        "error",
      );
    }
  });
  return (
    <Modal title={`Start ${sprint.name}`} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">
        {hasActiveSprint
          ? "Another sprint is already active. Complete it before starting this one."
          : "Set the active sprint dates."}
      </p>
      <form onSubmit={submit} className="space-y-4">
        <DateFields form={form} />
        <DialogActions
          pending={mutation.isPending}
          disabled={hasActiveSprint}
          onCancel={onClose}
          label="Start sprint"
        />
      </form>
    </Modal>
  );
}

export function CompleteSprintDialog({
  projectId,
  sprint,
  plannedSprints,
  onClose,
}: {
  projectId: string;
  sprint: Sprint;
  plannedSprints: Sprint[];
  onClose: () => void;
}) {
  const mutation = useCompleteSprint(projectId);
  const summaryMutation = useGenerateSprintSummary(sprint.id);
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const [destination, setDestination] = useState("backlog");
  const [generateSummary, setGenerateSummary] = useState(false);
  const unfinished = sprint.stats.totalTodos - sprint.stats.doneTodos;
  const submit = async () => {
    try {
      await mutation.mutateAsync({
        sprintId: sprint.id,
        body: { moveUnfinishedTo: destination },
      });
      if (generateSummary) {
        try {
          await summaryMutation.mutateAsync();
        } catch {
          addToast(
            "Sprint completed, but the AI summary could not be generated.",
            "error",
          );
        }
      }
      addToast("Sprint completed.");
      onClose();
      navigate(`/projects/${projectId}/sprints/${sprint.id}`);
    } catch (error) {
      addToast(
        error instanceof ApiError
          ? error.message
          : "Unable to complete this sprint.",
        "error",
      );
    }
  };
  return (
    <Modal title={`Complete ${sprint.name}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Metric label="Completed todos" value={sprint.stats.doneTodos} />
        <Metric label="Unfinished todos" value={unfinished} />
        <Metric label="Total points" value={sprint.stats.totalPoints} />
        <Metric label="Completed points" value={sprint.stats.donePoints} />
      </div>
      <label className="mt-5 block text-sm font-bold text-foreground">
        Move unfinished todos to
        <select
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className={inputClass}
        >
          <option value="backlog">Backlog</option>
          {plannedSprints.map((planned) => (
            <option key={planned.id} value={planned.id}>
              {planned.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <input
          type="checkbox"
          checked={generateSummary}
          onChange={(event) => setGenerateSummary(event.target.checked)}
        />{" "}
        Generate AI summary
      </label>
      <p className="mt-3 text-xs text-muted-foreground">
        AI can make mistakes. Review before saving.
      </p>
      <DialogActions
        pending={mutation.isPending || summaryMutation.isPending}
        onCancel={onClose}
        onConfirm={submit}
        label="Complete sprint"
      />
    </Modal>
  );
}

function SprintFields({
  form,
}: {
  form: ReturnType<typeof useForm<SprintValues>>;
}) {
  return (
    <>
      <Field label="Name" error={form.formState.errors.name?.message}>
        <input
          className={inputClass}
          placeholder="Sprint 3"
          {...form.register("name")}
        />
      </Field>
      <Field label="Goal" error={form.formState.errors.goal?.message}>
        <textarea
          rows={3}
          className={`${inputClass} h-auto py-3`}
          placeholder="What should this sprint achieve?"
          {...form.register("goal")}
        />
      </Field>
      <DateFields form={form} />
    </>
  );
}
function DateFields({
  form,
}: {
  form: ReturnType<typeof useForm<SprintValues>>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Start date"
        error={form.formState.errors.startDate?.message}
      >
        <input
          type="date"
          className={inputClass}
          {...form.register("startDate")}
        />
      </Field>
      <Field label="End date" error={form.formState.errors.endDate?.message}>
        <input
          type="date"
          className={inputClass}
          {...form.register("endDate")}
        />
      </Field>
    </div>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-foreground">
      {label}
      {children}
      {error && (
        <span className="mt-2 block text-xs font-semibold text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return (
    <div className={modalClass}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-foreground">{title}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-background"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function DialogActions({
  pending,
  disabled = false,
  onCancel,
  onConfirm,
  label,
  destructive = false,
}: {
  pending: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
  label: string;
  destructive?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="h-10 cursor-pointer rounded-xl border border-border px-4 text-sm font-bold text-foreground"
      >
        Cancel
      </button>
      <button
        type={onConfirm ? "button" : "submit"}
        onClick={onConfirm}
        disabled={pending || disabled}
        className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-extrabold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 ${destructive ? "bg-destructive" : "bg-primary"}`}
      >
        {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {label}
      </button>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-lg font-extrabold text-foreground">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
function applyErrors(
  error: unknown,
  form: {
    setError: (
      name: keyof SprintValues,
      error: { type: string; message: string },
    ) => void;
  },
) {
  if (error instanceof ApiError)
    Object.entries(fieldErrors(error)).forEach(([name, message]) => {
      if (name in sprintSchema.shape)
        form.setError(name as keyof SprintValues, { type: "server", message });
    });
}

export function SprintActions({
  projectId,
  sprint,
  hasActiveSprint,
  plannedSprints,
  onEdit,
  onDeleted,
}: {
  projectId: string;
  sprint: Sprint;
  hasActiveSprint: boolean;
  plannedSprints: Sprint[];
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [dialog, setDialog] = useState<"start" | "delete" | "complete" | null>(
    null,
  );
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {sprint.status === "planned" && (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-foreground hover:bg-background"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              disabled={hasActiveSprint}
              title={
                hasActiveSprint
                  ? "Complete the active sprint before starting another sprint"
                  : undefined
              }
              onClick={() => setDialog("start")}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 text-xs font-extrabold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Start
            </button>
            <button
              type="button"
              onClick={() => setDialog("delete")}
              aria-label={`Delete ${sprint.name}`}
              className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-destructive/20 px-3 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        {sprint.status === "active" && (
          <button
            type="button"
            onClick={() => setDialog("complete")}
            className="h-9 cursor-pointer rounded-lg bg-secondary px-3 text-xs font-extrabold text-white"
          >
            Complete sprint
          </button>
        )}
      </div>
      {dialog === "start" && (
        <StartSprintDialog
          projectId={projectId}
          sprint={sprint}
          hasActiveSprint={hasActiveSprint}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === "delete" && (
        <DeleteSprintDialog
          projectId={projectId}
          sprint={sprint}
          onClose={() => {
            setDialog(null);
            onDeleted();
          }}
        />
      )}
      {dialog === "complete" && (
        <CompleteSprintDialog
          projectId={projectId}
          sprint={sprint}
          plannedSprints={plannedSprints}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
