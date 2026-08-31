"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LoginStep = "ok" | "mfa_verify" | "mfa_setup"

type Step =
  | { kind: "credentials" }
  | { kind: "mfa_verify" }
  | { kind: "mfa_setup"; qrCodeDataUrl?: string; secret?: string }

const credentialsSchema = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
})

const codeSchema = z.object({
  code: z
    .string()
    .length(6, "O código tem 6 dígitos")
    .regex(/^\d{6}$/, "O código deve conter apenas números"),
})

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (data as { message?: string } | null)?.message ?? "Não foi possível completar a operação."
    throw new Error(message)
  }
  return data as T
}

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>({ kind: "credentials" })
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const credentialsForm = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
  })
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  })

  async function advance(next: { step: LoginStep }) {
    if (next.step === "ok") {
      router.push("/dashboard")
      router.refresh()
      return
    }
    if (next.step === "mfa_verify") {
      codeForm.reset({ code: "" })
      setStep({ kind: "mfa_verify" })
      return
    }
    const setup = await postJson<{ qrCodeDataUrl: string; secret: string }>(
      "/api/platform-auth/mfa/setup",
      {}
    )
    codeForm.reset({ code: "" })
    setStep({ kind: "mfa_setup", qrCodeDataUrl: setup.qrCodeDataUrl, secret: setup.secret })
  }

  async function withSubmission(action: () => Promise<void>) {
    setFormError(null)
    setIsSubmitting(true)
    try {
      await action()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Algo deu errado, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitCredentials = credentialsForm.handleSubmit((values) =>
    withSubmission(async () => {
      const result = await postJson<{ step: LoginStep }>("/api/platform-auth/login", values)
      await advance(result)
    })
  )

  const onSubmitVerify = codeForm.handleSubmit((values) =>
    withSubmission(async () => {
      const result = await postJson<{ step: LoginStep }>("/api/platform-auth/mfa/verify", values)
      await advance(result)
    })
  )

  const onSubmitEnable = codeForm.handleSubmit((values) =>
    withSubmission(async () => {
      const result = await postJson<{ step: LoginStep }>("/api/platform-auth/mfa/enable", values)
      await advance(result)
    })
  )

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{titleForStep(step)}</CardTitle>
        <CardDescription>{descriptionForStep(step)}</CardDescription>
      </CardHeader>
      <CardContent>
        {step.kind === "credentials" ? (
          <Form {...credentialsForm}>
            <form method="post" onSubmit={onSubmitCredentials} className="grid gap-4">
              <FormField
                control={credentialsForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={credentialsForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitError message={formError} />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        ) : null}

        {step.kind === "mfa_verify" ? (
          <Form {...codeForm}>
            <form method="post" onSubmit={onSubmitVerify} className="grid gap-4">
              <CodeField control={codeForm.control} />
              <SubmitError message={formError} />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Verificando..." : "Verificar"}
              </Button>
            </form>
          </Form>
        ) : null}

        {step.kind === "mfa_setup" ? (
          <div className="grid gap-4">
            {step.qrCodeDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- imagem dinâmica (data URL), não passa pelo otimizador
              <img
                src={step.qrCodeDataUrl}
                alt="QR code para configurar o autenticador"
                width={200}
                height={200}
                className="mx-auto"
              />
            ) : null}
            {step.secret ? (
              <p className="break-all text-center text-xs text-muted-foreground">
                Ou insira manualmente: {step.secret}
              </p>
            ) : null}
            <Form {...codeForm}>
              <form method="post" onSubmit={onSubmitEnable} className="grid gap-4">
                <CodeField control={codeForm.control} />
                <SubmitError message={formError} />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Ativando..." : "Ativar MFA"}
                </Button>
              </form>
            </Form>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function CodeField({ control }: { control: ReturnType<typeof useForm<z.infer<typeof codeSchema>>>["control"] }) {
  return (
    <FormField
      control={control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código do autenticador</FormLabel>
          <FormControl>
            <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SubmitError({ message }: { message: string | null }) {
  if (!message) return null
  return <p className="text-destructive text-sm">{message}</p>
}

function titleForStep(step: Step) {
  switch (step.kind) {
    case "credentials":
      return "Entrar"
    case "mfa_verify":
      return "Verificação em duas etapas"
    case "mfa_setup":
      return "Configure o autenticador"
  }
}

function descriptionForStep(step: Step) {
  switch (step.kind) {
    case "credentials":
      return "Acesse o painel MRCOIN com seu e-mail e senha."
    case "mfa_verify":
      return "Digite o código de 6 dígitos do seu app autenticador."
    case "mfa_setup":
      return "Escaneie o QR code com um app autenticador e confirme o primeiro código."
  }
}
