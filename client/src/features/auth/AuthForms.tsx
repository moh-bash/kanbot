import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { z } from "zod";
import { login, register } from "../../api/auth";
import { ApiError, fieldErrors } from "../../api/client";
import { AuthLayout } from "./AuthLayout";
import { AuthInput, PasswordInput } from "./AuthInputs";
import { useAuth } from "./useAuth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [queryError, setQueryError] = useStateFromLocation();
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = form.handleSubmit(async (values) => {
    setQueryError("");
    try {
      const response = await login(values);
      if (response) {
        setSession(response.token, response.user);
        const redirect = new URLSearchParams(location.search).get("redirect");
        navigate(isSafeRedirect(redirect) ? redirect : "/projects", {
          replace: true,
        });
      }
    } catch (error) {
      handleFormError(error, form.setError, setQueryError);
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to continue building with Kanbot."
      brandHeadline="Your work, in focus."
      brandSubtext="Bring your projects, sprints, and AI-powered planning into one focused workspace."
      footer={
        <>
          New to Kanbot?{" "}
          <Link
            className="font-bold text-primary transition-colors hover:text-primary-hover"
            to="/register"
          >
            Create an account
          </Link>
        </>
      }
    >
      {queryError && <ErrorBanner message={queryError} />}
      <form
        className="space-y-5"
        onSubmit={onSubmit}
        noValidate
        autoComplete="on"
      >
        <AuthInput
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          name="email"
          type="email"
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
          autoComplete="username"
          placeholder="Enter your email"
        />
        <PasswordInput
          label="Password"
          name="password"
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <SubmitButton loading={form.formState.isSubmitting}>
          Log in
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [queryError, setQueryError] = useStateFromLocation();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setQueryError("");
    try {
      const response = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (response) {
        setSession(response.token, response.user);
        navigate("/projects", { replace: true });
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        form.setError("email", {
          type: "server",
          message: "An account with this email already exists.",
        });
      } else {
        handleFormError(error, form.setError, setQueryError);
      }
    }
  });

  return (
    <AuthLayout
      title="Start building with Kanbot"
      description="Organize your work, plan better sprints, and move projects forward with AI."
      brandHeadline="Turn busy backlogs into clear sprints."
      brandSubtext="Simple project management powered by intelligent planning. Get your team focused on what matters."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-bold text-primary transition-colors hover:text-primary-hover"
            to="/login"
          >
            Log in
          </Link>
        </>
      }
    >
      {queryError && <ErrorBanner message={queryError} />}
      <form
        className="space-y-5"
        onSubmit={onSubmit}
        noValidate
        autoComplete="on"
      >
        <AuthInput
          icon={<UserRound className="h-5 w-5" />}
          label="Full name"
          name="name"
          registration={form.register("name")}
          error={form.formState.errors.name?.message}
          autoComplete="name"
          placeholder="Enter your full name"
        />
        <AuthInput
          icon={<Mail className="h-5 w-5" />}
          label="Email"
          name="email"
          type="email"
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
          autoComplete="email"
          placeholder="Enter your email"
        />
        <PasswordInput
          label="Password"
          name="password"
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
          autoComplete="new-password"
          placeholder="Create a password"
        />
        <PasswordInput
          label="Confirm password"
          name="confirmPassword"
          registration={form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
          autoComplete="new-password"
          placeholder="Confirm your password"
        />
        <SubmitButton loading={form.formState.isSubmitting}>
          Create account
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-primary-foreground transition-all hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {loading ? "Please wait…" : children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}

function handleFormError(
  error: unknown,
  setError: (name: never, error: { type: string; message: string }) => void,
  setGeneralError: (message: string) => void,
) {
  if (error instanceof ApiError) {
    const errors = fieldErrors(error);
    Object.entries(errors).forEach(([name, message]) =>
      setError(name as never, { type: "server", message }),
    );
    if (error.status === 409 && !errors.email) {
      setGeneralError(error.message);
    } else if (error.status !== 400 && !Object.keys(errors).length) {
      setGeneralError(error.message);
    }
    return;
  }
  setGeneralError("Something went wrong. Please try again.");
}

function isSafeRedirect(path: string | null): path is string {
  return Boolean(path?.startsWith("/") && !path.startsWith("//"));
}

function useStateFromLocation(): [string, (value: string) => void] {
  const location = useLocation();
  const [value, setValue] = useState(() =>
    new URLSearchParams(location.search).get("message") === "session-expired"
      ? "Your session has expired. Please log in again."
      : "",
  );
  return [value, setValue];
}
