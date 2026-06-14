#!/usr/bin/env python3
"""Orquestador del TFI - Sistema de Gestión de Proyectos (DAW 2026).

Uso:
    python manage.py setup       Instala dependencias (npm) y descarga nginx
    python manage.py db          Crea rol/base de datos y ejecuta el script de la cátedra
    python manage.py seed        Carga datos de demostración (seed-demo.sql)
    python manage.py dev         Levanta backend (watch) y frontend (ng serve) en modo desarrollo
    python manage.py build       Compila backend y frontend para producción
    python manage.py start       Despliegue: backend con PM2 + nginx sirviendo el frontend
    python manage.py stop        Detiene PM2 y nginx
    python manage.py status      Estado detallado: DB, nginx, PM2 y puertos
    python manage.py logs        Logs del backend en PM2
    python manage.py swagger on  Habilita Swagger UI (reinicia backend si está corriendo)
    python manage.py swagger off Deshabilita Swagger UI
"""

import argparse
import glob
import os
import shutil
import socket
import subprocess
import sys
import urllib.request
import zipfile


def swagger_disponible() -> bool:
    try:
        with urllib.request.urlopen("http://localhost:3000/docs", timeout=2) as r:
            return r.status == 200
    except Exception:
        return False

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "backend")
FRONTEND = os.path.join(ROOT, "frontend")
DEPLOY = os.path.join(ROOT, "deploy")
DB_SCRIPT = os.path.join(ROOT, "db", "Script_BD.sql")
DB_SEED = os.path.join(ROOT, "db", "seed-demo.sql")

NGINX_VERSION = "1.30.2"
NGINX_ZIP_URL = f"https://nginx.org/download/nginx-{NGINX_VERSION}.zip"


def encontrar_nginx() -> str:
    """Busca nginx.exe: NGINX_HOME, C:\\nginx*, o la copia local en deploy/."""
    candidatos = []
    if os.environ.get("NGINX_HOME"):
        candidatos.append(os.environ["NGINX_HOME"])
    candidatos += sorted(glob.glob(r"C:\nginx*"), reverse=True)
    candidatos += sorted(glob.glob(os.path.join(DEPLOY, "nginx-*")), reverse=True)
    for carpeta in candidatos:
        exe = os.path.join(carpeta, "nginx.exe")
        if os.path.isfile(exe):
            return exe
    return ""

DB_NAME = "tfi"
DB_USER = "Equipo-W"
DB_PASS = "equipow"


def leer_env() -> dict[str, str]:
    """Lee backend/.env y devuelve sus variables como dict."""
    env_file = os.path.join(BACKEND, ".env")
    out: dict[str, str] = {}
    if not os.path.isfile(env_file):
        return out
    with open(env_file, encoding="utf-8") as f:
        for linea in f:
            linea = linea.strip()
            if linea and not linea.startswith("#") and "=" in linea:
                k, _, v = linea.partition("=")
                out[k.strip()] = v.strip()
    return out


def credenciales_db() -> tuple[str, str, str]:
    """Devuelve (db_user, db_pass, db_name) leyendo .env con fallback a constantes."""
    env = leer_env()
    return (
        env.get("DB_USER", DB_USER),
        env.get("DB_PASS", DB_PASS),
        env.get("DB_NAME", DB_NAME),
    )


def run(cmd: str, cwd: str | None = None, check: bool = True, env: dict | None = None) -> int:
    print(f"\n> {cmd}" + (f"  (en {os.path.relpath(cwd, ROOT)})" if cwd else ""))
    merged_env = {**os.environ, **(env or {})}
    result = subprocess.run(cmd, cwd=cwd or ROOT, shell=True, env=merged_env)
    if check and result.returncode != 0:
        sys.exit(result.returncode)
    return result.returncode


def puerto_abierto(puerto: int) -> bool:
    for familia, host in (
        (socket.AF_INET,  "127.0.0.1"),
        (socket.AF_INET6, "::1"),
    ):
        try:
            with socket.socket(familia, socket.SOCK_STREAM) as s:
                s.settimeout(1)
                if s.connect_ex((host, puerto)) == 0:
                    return True
        except OSError:
            pass
    return False


def encontrar_psql() -> str:
    en_path = shutil.which("psql")
    if en_path:
        return f'"{en_path}"'
    base = r"C:\Program Files\PostgreSQL"
    if os.path.isdir(base):
        versiones = sorted(os.listdir(base), reverse=True)
        for v in versiones:
            candidato = os.path.join(base, v, "bin", "psql.exe")
            if os.path.isfile(candidato):
                return f'"{candidato}"'
    sys.exit("No se encontró psql. Instalá PostgreSQL o agregalo al PATH.")


# ----------------------------------------------------------------------------
# Comandos
# ----------------------------------------------------------------------------

def cmd_setup(_args) -> None:
    run("npm install", cwd=BACKEND)
    run("npm install", cwd=FRONTEND)

    nginx_exe = encontrar_nginx()
    if not nginx_exe:
        print(f"\n> nginx no encontrado, descargando {NGINX_VERSION} en deploy/ ...")
        os.makedirs(DEPLOY, exist_ok=True)
        zip_path = os.path.join(DEPLOY, "nginx.zip")
        urllib.request.urlretrieve(NGINX_ZIP_URL, zip_path)
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(DEPLOY)
        os.remove(zip_path)
        nginx_exe = encontrar_nginx()
    print(f"> nginx: {nginx_exe}")
    shutil.copy(
        os.path.join(os.path.dirname(nginx_exe), "conf", "mime.types"),
        os.path.join(DEPLOY, "mime.types"),
    )
    for carpeta in ("logs", "temp"):
        os.makedirs(os.path.join(DEPLOY, carpeta), exist_ok=True)

    env_file = os.path.join(BACKEND, ".env")
    if not os.path.isfile(env_file):
        shutil.copy(os.path.join(BACKEND, ".env.example"), env_file)
        print("> backend/.env creado desde .env.example (revisá las credenciales)")

    print("\nSetup completo. Siguiente paso: python manage.py db")


def cmd_db(args) -> None:
    import getpass
    psql = encontrar_psql()
    db_user, db_pass, db_name = credenciales_db()
    app_env = {"PGPASSWORD": db_pass}

    print(f"\n  Conexión: {db_user}@localhost/{db_name}")

    # ── Si la base ya existe, solo aplicar el schema. ────────────────────────
    db_ok = subprocess.run(
        f'{psql} -U "{db_user}" -h localhost -d {db_name} -c "SELECT 1;"',
        shell=True, env={**os.environ, **app_env}, capture_output=True,
    ).returncode == 0

    def necesita_admin() -> bool:
        """True si el usuario de la app no puede crear objetos en el schema public."""
        r = subprocess.run(
            f'{psql} -U "{db_user}" -h localhost -d {db_name}'
            f' -c "SELECT has_schema_privilege(current_user, \'public\', \'CREATE\');"',
            shell=True, env={**os.environ, **app_env}, capture_output=True, text=True,
        )
        return "t" not in r.stdout

    def ejecutar_como_admin(sqls: list[str]) -> None:
        sin_pass = {k: v for k, v in os.environ.items() if k != "PGPASSWORD"}
        # Intentar sin contraseña (SSPI / trust / .pgpass — funciona en la mayoría de instalaciones locales).
        puede_sin_clave = subprocess.run(
            f'{psql} -U postgres -h localhost -d postgres -c "SELECT 1;"',
            shell=True, env=sin_pass, capture_output=True,
        ).returncode == 0
        if puede_sin_clave:
            admin_env = sin_pass
        else:
            print(f"\n  Se necesita la clave del superusuario postgres una sola vez.")
            clave_pg = args.password or getpass.getpass("  Clave de postgres: ")
            admin_env = {**sin_pass, "PGPASSWORD": clave_pg}
        for sql in sqls:
            run(f'{psql} -U postgres -h localhost -c "{sql}"', check=False, env=admin_env)
        run(
            f'{psql} -U postgres -h localhost -d {db_name}'
            f' -c "GRANT ALL ON SCHEMA public TO \\"{db_user}\\"; CREATE EXTENSION IF NOT EXISTS pgcrypto;"',
            check=False, env=admin_env,
        )

    if not db_ok:
        # Intentar crear la base con credenciales de la app (tiene CREATEDB desde
        # la primera ejecución exitosa).
        creada = subprocess.run(
            f'{psql} -U "{db_user}" -h localhost -d postgres -c "CREATE DATABASE {db_name};"',
            shell=True, env={**os.environ, **app_env}, capture_output=True,
        ).returncode == 0

        if not creada:
            ejecutar_como_admin([
                f'CREATE ROLE \\"{db_user}\\" WITH LOGIN PASSWORD \'{db_pass}\' CREATEDB',
                f'CREATE DATABASE {db_name}',
            ])
    elif necesita_admin():
        # Base existente pero sin permisos de schema (PostgreSQL 15+).
        ejecutar_como_admin([])

    # ── Aplicar schema (idempotente en re-runs gracias a IF NOT EXISTS) ───────
    run(f'{psql} -U "{db_user}" -h localhost -d {db_name} -f "{DB_SCRIPT}"', env=app_env)
    print("\nBase de datos lista. Login en la app: usuario / clave")


def cmd_seed(_args) -> None:
    if not os.path.isfile(DB_SEED):
        sys.exit(f"No se encontró {DB_SEED}. Revisá que el archivo existe.")
    psql = encontrar_psql()
    db_user, db_pass, db_name = credenciales_db()
    print(f"\nAplicando datos de demostración...")
    print(f"  Archivo  : {os.path.relpath(DB_SEED, ROOT)}")
    print(f"  Conexión : {db_user}@localhost/{db_name}")
    run(
        f'{psql} -U "{db_user}" -h localhost -d {db_name} -f "{DB_SEED}"',
        env={"PGPASSWORD": db_pass},
    )
    print("\nSeed aplicado. Datos de demo listos para el video.")


def cmd_dev(_args) -> None:
    print("Levantando backend (:3000) y frontend (:4200)... Ctrl+C para detener.")
    procesos = [
        subprocess.Popen("npm run start:dev", cwd=BACKEND, shell=True),
        subprocess.Popen("npm start", cwd=FRONTEND, shell=True),
    ]
    try:
        for p in procesos:
            p.wait()
    except KeyboardInterrupt:
        print("\nDeteniendo servidores de desarrollo...")
        for p in procesos:
            p.terminate()


def cmd_build(_args) -> None:
    run("npm run build", cwd=BACKEND)
    run("npm run build", cwd=FRONTEND)
    print("\nBuild completo.")


def cmd_start(args) -> None:
    backend_dist = os.path.join(BACKEND, "dist", "main.js")
    frontend_dist = os.path.join(FRONTEND, "dist", "frontend", "browser", "index.html")
    if args.build or not (os.path.isfile(backend_dist) and os.path.isfile(frontend_dist)):
        cmd_build(args)

    nginx_exe = encontrar_nginx()
    if not nginx_exe:
        sys.exit("nginx no está instalado. Ejecutá primero: python manage.py setup")

    run(f'pm2 start "{os.path.join(DEPLOY, "ecosystem.config.js")}"')

    if puerto_abierto(8080):
        print("> nginx ya está corriendo en :8080, recargando configuración...")
        run(f'"{nginx_exe}" -p "{DEPLOY}" -c nginx.conf -s reload', cwd=DEPLOY)
    else:
        subprocess.Popen(
            [nginx_exe, "-p", DEPLOY, "-c", "nginx.conf"],
            cwd=DEPLOY,
            creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP,
        )
        print("> nginx iniciado.")

    print("\nAplicación desplegada: http://localhost:8080  (API: /api, Swagger backend: :3000/docs)")


def cmd_stop(_args) -> None:
    run("pm2 delete tfi-backend", check=False)
    nginx_exe = encontrar_nginx()
    if nginx_exe and puerto_abierto(8080):
        run(f'"{nginx_exe}" -p "{DEPLOY}" -c nginx.conf -s stop', cwd=DEPLOY, check=False)
        print("> nginx detenido.")
    else:
        print("> nginx no estaba corriendo.")


def cmd_status(_args) -> None:
    sep = "─" * 54
    print(f"\n{'═' * 54}")
    print("  TFI — Estado del sistema")
    print(f"{'═' * 54}")

    db_user, _, db_name = credenciales_db()
    print(f"\n  Base de datos")
    print(f"    Host    : localhost:5432")
    print(f"    DB      : {db_name}")
    print(f"    Usuario : {db_user}")

    nginx_exe = encontrar_nginx()
    print(f"\n  nginx")
    if nginx_exe:
        ver_result = subprocess.run(
            [nginx_exe, "-v"], capture_output=True, text=True
        )
        nginx_ver = (ver_result.stderr or ver_result.stdout).strip()
        print(f"    Versión : {nginx_ver}")
        print(f"    Binario : {nginx_exe}")
        print(f"    Config  : {os.path.join(DEPLOY, 'nginx.conf')}")
    else:
        print("    (no encontrado — ejecutá: python manage.py setup)")

    print(f"\n  PM2 — procesos\n{sep}")
    run("pm2 list", check=False)
    print(sep)

    backend_up = puerto_abierto(3000)
    nginx_up   = puerto_abierto(8080)
    dev_up     = puerto_abierto(4200)
    es_prod    = nginx_up
    swagger_ok = (not es_prod) and swagger_disponible() if backend_up else False

    def fila(ok: bool, puerto: int, nombre: str, url: str, nota: str = "") -> str:
        icono = "✔" if ok else "✘"
        destino = nota if nota else (url if ok else "abajo")
        return f"    {icono} :{puerto}  {nombre:<18} {destino}"

    print("  Servicios")
    print(fila(backend_up, 3000, "Backend API",  "http://localhost:3000/api"))
    if es_prod:
        print(f"    - :3000  {'Swagger UI':<18} deshabilitado (prod)")
    else:
        print(fila(swagger_ok, 3000, "Swagger UI",  "http://localhost:3000/docs"))
    print(fila(nginx_up,   8080, "nginx (prod)", "http://localhost:8080"))
    print(fila(dev_up,     4200, "Frontend dev", "http://localhost:4200"))

    print()


def cmd_logs(_args) -> None:
    run("pm2 logs tfi-backend --lines 50", check=False)


def _escribir_env_var(clave: str, valor: str | None) -> None:
    env_file = os.path.join(BACKEND, ".env")
    lineas: list[str] = []
    if os.path.isfile(env_file):
        with open(env_file, encoding="utf-8") as f:
            lineas = f.readlines()
    lineas = [l for l in lineas if not l.strip().startswith(f"{clave}=")]
    if valor is not None:
        lineas.append(f"{clave}={valor}\n")
    with open(env_file, "w", encoding="utf-8") as f:
        f.writelines(lineas)


def cmd_swagger(args) -> None:
    env = leer_env()
    activo = env.get("SWAGGER", "").lower() == "true"

    if args.estado is None:
        estado_str = "habilitado" if activo else "deshabilitado"
        print(f"\n  Swagger UI: {estado_str}")
        print("  Uso: python manage.py swagger on|off")
        return

    activar = args.estado == "on"
    if activar == activo:
        print(f"\n  Swagger ya estaba {'habilitado' if activar else 'deshabilitado'}.")
        return

    if activar:
        _escribir_env_var("SWAGGER", "true")
        print("\n  Swagger habilitado en backend/.env")
    else:
        _escribir_env_var("SWAGGER", None)
        print("\n  Swagger deshabilitado (variable eliminada de backend/.env)")

    if puerto_abierto(3000):
        print("  Reiniciando backend para aplicar el cambio...")
        run("pm2 restart tfi-backend --update-env", check=False)
    else:
        print("  Backend no esta corriendo. El cambio aplica al proximo start.")


def main() -> None:
    if sys.platform == "win32":
        import ctypes
        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(
        prog="manage.py",
        description="Orquestador del TFI - Sistema de Gestión de Proyectos",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Uso:")[1],
    )
    sub = parser.add_subparsers(dest="comando", required=True)

    sub.add_parser("setup", help="instala dependencias y descarga nginx").set_defaults(fn=cmd_setup)

    p_db = sub.add_parser("db", help="aplica el schema SQL (primera vez pide clave de postgres)")
    p_db.add_argument("--password", help="clave de postgres (solo primera vez, opcional)")
    p_db.set_defaults(fn=cmd_db)

    sub.add_parser("seed", help="carga datos de demostración (seed-demo.sql)").set_defaults(fn=cmd_seed)

    sub.add_parser("dev", help="backend y frontend en modo desarrollo").set_defaults(fn=cmd_dev)
    sub.add_parser("build", help="compila backend y frontend").set_defaults(fn=cmd_build)

    p_start = sub.add_parser("start", help="despliegue con PM2 + nginx")
    p_start.add_argument("--build", action="store_true", help="fuerza rebuild antes de iniciar")
    p_start.set_defaults(fn=cmd_start)

    sub.add_parser("stop", help="detiene PM2 y nginx").set_defaults(fn=cmd_stop)
    sub.add_parser("status", help="estado de servicios").set_defaults(fn=cmd_status)
    sub.add_parser("logs", help="logs del backend").set_defaults(fn=cmd_logs)

    p_swagger = sub.add_parser("swagger", help="habilita o deshabilita Swagger UI en produccion")
    p_swagger.add_argument("estado", nargs="?", choices=["on", "off"], help="on|off (sin argumento muestra el estado)")
    p_swagger.set_defaults(fn=cmd_swagger)

    args = parser.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
