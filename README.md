# ERP Sport Shark S.R.L. (Dolibarr + React)

Infraestructura ERP contenerizada con Docker para la gestión operativa comercial, control de inventarios y facturación multicanal de la tienda de ropa deportiva **Sport Shark S.R.L.** (Cochabamba, Bolivia). 
Proyecto desarrollado para la asignatura de Administración II.

---

## 🏗️ Arquitectura del Sistema

* **Core ERP:** Dolibarr ERP/CRM (v19.0.2).
* **Base de Datos:** MariaDB 10.8 (`utf8mb4`).
* **Contenedores Docker:**
  * `sportshark-dolibarr-web` (Puerto `8081:80`).
  * `sportshark-dolibarr-db` (Puerto interno `3306`).
* **Módulos Activos (Retail):** Terceros (CRM), Productos y Variantes de Talla, Stocks/Multialmacén, Comercial/Facturación, Bancos/Cajas y API REST. No se utiliza módulo de manufactura (MRP).

---

## 🚀 Despliegue del Entorno

### 1. Levantar Contenedores
```powershell
docker compose up -d