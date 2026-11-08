import fs from "node:fs";
import path from "node:path";

/** @typedef {"none" | "credentials" | "domain"} AuthMode */

export const AUTH_MODE_META = {
  none: {
    label: "Без авторизации",
    hint: "middleware не редиректит, гостевой пользователь",
  },
  credentials: {
    label: "Логин и пароль",
    hint: "страница /sign-in + LoginForm",
  },
  domain: {
    label: "Доменная (SSO / AD)",
    hint: "страница /sign-in без пароля, вход одной кнопкой",
  },
};

export const AUTH_MODE_OPTIONS = [
  {
    value: "none",
    label: AUTH_MODE_META.none.label,
    hint: AUTH_MODE_META.none.hint,
  },
  {
    value: "credentials",
    label: AUTH_MODE_META.credentials.label,
    hint: AUTH_MODE_META.credentials.hint,
  },
  {
    value: "domain",
    label: AUTH_MODE_META.domain.label,
    hint: AUTH_MODE_META.domain.hint,
  },
];

/**
 * @param {string} projectRoot
 * @param {AuthMode} mode
 */
export function writeAuthMode(projectRoot, mode) {
  const filePath = path.join(
    projectRoot,
    "app/shared/constants/authMode.ts",
  );
  let source = fs.readFileSync(filePath, "utf8");

  if (
    !/export const AUTH_MODE: TAuthMode = "(none|credentials|domain)"/.test(
      source,
    )
  ) {
    throw new Error(`Не найден AUTH_MODE в ${filePath}`);
  }

  source = source.replace(
    /export const AUTH_MODE: TAuthMode = "(none|credentials|domain)"/,
    `export const AUTH_MODE: TAuthMode = "${mode}"`,
  );

  fs.writeFileSync(filePath, source, "utf8");
}
