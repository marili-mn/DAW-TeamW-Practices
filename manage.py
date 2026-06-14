#!/usr/bin/env python3
"""Orquestador del TFI - Sistema de Gestión de Proyectos (DAW 2026).

Uso:
    python manage.py setup    Instala dependencias (npm) y descarga nginx
    python manage.py db       Crea rol/base de datos y ejecuta el script de la cátedra
    python manage.py seed     Carga datos de demostración (seed-demo.sql)
    python manage.py dev      Levanta backend (watch) y frontend (ng serve) en modo desarrollo
    python manage.py build    Compila backend y frontend para producción
    python manage.py start    Despliegue: backend con PM2 + nginx sirviendo el frontend
    python manage.py stop     Detiene PM2 y nginx
    python manage.py status   Estado detallado: DB, nginx, PM2 y puertos
    python manage.py logs     Logs del backend en PM2
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


def run(cmd: str, cwd: str | None = None, check: bool = True, env: dict | None = None) -> int:
    print(f"\n> {cmd}" + (f"  (en {os.path.relpath(cwd, ROOT)})" if cwd else ""))
    merged_env = {**os.environ, **(env or {})}
    result = subprocess.run(cmd, cwd=cwd or ROOT, shell=True, env=merged_env)
    if check and result.returncode != 0:
        sys.exit(result.returncode)
    return result.returncode


def puerto_abierto(puerto: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(("127.0.0.1", puerto)) == 0


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
    psql = encontrar_psql()
    clave_postgres = args.password or os.environ.get("PGPASSWORD")
    if not clave_postgres:
        import getpass

        clave_postgres = getpass.getpass("Clave del usuario postgres: ")

    env_admin = {"PGPASSWORD": clave_postgres}
    run(
        f'{psql} -U postgres -h localhost -c "CREATE ROLE \\"{DB_USER}\\" WITH LOGIN PASSWORD \'{DB_PASS}\';"',
        check=False,
        env=env_admin,
    )
    run(
        f'{psql} -U postgres -h localhost -c "CREATE DATABASE {DB_NAME} OWNER \\"{DB_USER}\\";"',
        check=False,
        env=env_admin,
    )
    run(
        f'{psql} -U "{DB_USER}" -h localhost -d {DB_NAME} -f "{DB_SCRIPT}"',
        env={"PGPASSWORD": DB_PASS},
    )
    print("\nBase de datos lista. Credenciales de la app: usuario / clave")


def cmd_seed(_args) -> None:
    if not os.path.isfile(DB_SEED):
        sys.exit(f"No se encontró {DB_SEED}. Revisá que el archivo existe.")
    psql = encontrar_psql()
    print(f"\nAplicando datos de demostración...")
    print(f"  Archivo  : {os.path.relpath(DB_SEED, ROOT)}")
    print(f"  Conexión : {DB_USER}@localhost/{DB_NAME}")
    run(
        f'{psql} -U "{DB_USER}" -h localhost -d {DB_NAME} -f "{DB_SEED}"',
        env={"PGPASSWORD": DB_PASS},
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

    # ── Base de datos ────────────────────────────────────────
    print(f"\n  Base de datos")
    print(f"    Host    : localhost:5432")
    print(f"    DB      : {DB_NAME}")
    print(f"    Usuario : {DB_USER}")

    # ── nginx ────────────────────────────────────────────────
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

    # ── PM2 ─────────────────────────────────────────────────
    print(f"\n  PM2 — procesos\n{sep}")
    run("pm2 list", check=False)
    print(sep)

    # ── Puertos ──────────────────────────────────────────────
    print("  Puertos")
    checks = [
        (3000, "Backend API",   "http://localhost:3000/api"),
        (3000, "Swagger docs",  "http://localhost:3000/docs"),
        (8080, "nginx (prod)",  "http://localhost:8080"),
        (4200, "Frontend dev",  "http://localhost:4200"),
    ]
    seen_ports: set[int] = set()
    for puerto, nombre, url in checks:
        if puerto not in seen_ports:
            ok = puerto_abierto(puerto)
            seen_ports.add(puerto)
        icono = "✔" if ok else "✘"
        estado = url if ok else "abajo"
        print(f"    {icono} :{puerto}  {nombre:<16} {estado}")

    print()


def cmd_logs(_args) -> None:
    run("pm2 logs tfi-backend --lines 50", check=False)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="manage.py",
        description="Orquestador del TFI - Sistema de Gestión de Proyectos",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Uso:")[1],
    )
    sub = parser.add_subparsers(dest="comando", required=True)

    sub.add_parser("setup", help="instala dependencias y descarga nginx").set_defaults(fn=cmd_setup)

    p_db = sub.add_parser("db", help="crea rol/base y ejecuta el script SQL")
    p_db.add_argument("--password", help="clave del usuario postgres (o usa PGPASSWORD)")
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

    args = parser.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
