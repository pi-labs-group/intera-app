"use client";

import { useActionState, useState } from "react";
import {
  FIELD_ERROR_CLASSES,
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
} from "@/components/ui/form-classes";
import { ROLE_ORDER, ROLES } from "@/lib/roles";
import type { Role } from "@/lib/validation/auth";
import { login, type LoginFormState } from "./actions";

const INITIAL_STATE: LoginFormState = {};

/**
 * Formulário de acesso com escolha de perfil. Os campos são controlados para não
 * se perderem quando a Server Action devolve erro (o React reinicia formulários
 * não controlados após a action). Escolher um perfil preenche o e-mail de demo.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);
  const [role, setRole] = useState<Role>("guardian");
  const [email, setEmail] = useState(ROLES.guardian.demoEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const errors = state.fieldErrors ?? {};

  function selectRole(nextRole: Role) {
    setRole(nextRole);
    setEmail(ROLES[nextRole].demoEmail);
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-neutral-800">
          Entrar como
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_ORDER.map((option) => {
            const info = ROLES[option];
            const isSelected = role === option;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary ${
                  isSelected
                    ? "border-primary bg-primary-softer text-primary"
                    : "border-neutral-200 bg-surface text-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option}
                  checked={isSelected}
                  onChange={() => selectRole(option)}
                  className="sr-only"
                />
                <span className="material-symbols-outlined" aria-hidden="true">
                  {info.icon}
                </span>
                {info.label}
              </label>
            );
          })}
        </div>
        {errors.role && <p className={FIELD_ERROR_CLASSES}>{errors.role}</p>}
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="email" className={LABEL_CLASSES}>
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={INPUT_CLASSES}
        />
        {errors.email && (
          <p id="email-error" className={FIELD_ERROR_CLASSES}>
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className={LABEL_CLASSES}>
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password ? "password-error password-hint" : "password-hint"
            }
            className={`${INPUT_CLASSES} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className={FIELD_ERROR_CLASSES}>
            {errors.password}
          </p>
        )}
        <p id="password-hint" className="text-xs text-neutral-500">
          Ambiente de demonstração: qualquer senha é aceita.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={PRIMARY_BUTTON_CLASSES}
      >
        {isPending ? "Entrando…" : `Entrar como ${ROLES[role].label}`}
      </button>
      {/* TODO (fase E): link "Esqueci minha senha" com recuperação via Supabase */}
    </form>
  );
}
