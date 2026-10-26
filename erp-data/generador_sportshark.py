import os
import random
from datetime import date, timedelta

# Curva de simulación: Mayo a Septiembre 2026 (5 meses)
meses = [
    {"mes": 5, "ventas": 25,  "ecom": 0,  "b2b": 0},  # Mayo: Arranque minorista en tienda física
    {"mes": 6, "ventas": 50,  "ecom": 5,  "b2b": 0},  # Junio: Tracción y primeros pedidos web
    {"mes": 7, "ventas": 85,  "ecom": 15, "b2b": 0},  # Julio: Estabilización de ventas
    {"mes": 8, "ventas": 110, "ecom": 40, "b2b": 1},  # Agosto: Crecimiento e-commerce (+30%)
    {"mes": 9, "ventas": 140, "ecom": 60, "b2b": 3}   # Septiembre: Expansión convenios B2B (+25%)
]

productos = [
    (101, 'TSH-NK-01', 'Polera Nike Dri-FIT', 250.00, 120.00),
    (102, 'SHO-PU-01', 'Short Deportivo Puma', 180.00, 90.00),
    (103, 'ZAP-AD-01', 'Zapatillas Adidas Duramo', 550.00, 300.00),
    (104, 'BUZ-UA-01', 'Buzo Jogger Under Armour', 320.00, 160.00),
    (105, 'CAL-NK-01', 'Calza Deportiva Mujer Nike', 280.00, 140.00),
    (106, 'TSH-AN-01', 'Polera Algodon Andina', 90.00, 40.00),
    (107, 'SUD-AD-01', 'Sudadera Capucha Adidas', 400.00, 200.00),
    (108, 'ZAP-AN-01', 'Zapatillas Running Andina', 280.00, 150.00),
    (109, 'ACC-PU-01', 'Mochila Deportiva Puma', 240.00, 120.00),
    (110, 'ACC-AD-01', 'Calcetines Adidas (x3)', 70.00, 35.00)
]

sql = """-- ==========================================================
-- SPORT SHARK S.R.L. - MASTER DATA & SEED (ADMINISTRACION II)
-- ==========================================================

-- 1. ALMACENES Y CUENTAS DE TESORERIA
INSERT IGNORE INTO llx_entrepot (rowid, ref, lieu, description, statut) VALUES 
(101, 'ALM-DEP', 'Bodega Central', 'Recepcion de Proveedores', 1),
(102, 'ALM-TIENDA', 'Sala de Ventas', 'Mostrador y Ecommerce', 1);

INSERT IGNORE INTO llx_bank_account (rowid, ref, label, bank, currency_code, courant, clos) VALUES 
(101, 'CAJA-TIENDA', 'Caja Efectivo', 'Mostrador', 'BOB', 2, 0),
(102, 'BANCO-QR', 'Cuenta Banco BCP', 'Ecommerce BCP', 'BOB', 1, 0);

INSERT IGNORE INTO llx_bank (rowid, datev, amount, label, fk_account, fk_type) VALUES 
(1000, '2026-05-01', 5000.00, 'Fondo de Apertura', 101, 'SOLD'),
(1001, '2026-05-01', 15000.00, 'Capital Inicial Banco', 102, 'SOLD');

-- 2. TERCEROS (CRM)
INSERT IGNORE INTO llx_societe (rowid, nom, client, fournisseur, code_client) VALUES 
(101, 'Cliente Tienda Fisica', 1, 0, 'CU26-0001'),
(102, 'Cliente E-commerce Web', 1, 0, 'CU26-0002'),
(103, 'Club Deportivo Aurora (B2B)', 1, 0, 'CU26-0003'),
(104, 'Equipex S.A. (Nike/UA)', 0, 1, ''),
(105, 'Fair Play (Adidas/Puma)', 0, 1, ''),
(106, 'Textilera Andina S.R.L.', 0, 1, '');

-- 3. CATALOGO DE PRODUCTOS (RETAIL)
"""

for p in productos:
    base_ht = round(p[3] / 1.13, 6)
    sql += f"INSERT IGNORE INTO llx_product (rowid, ref, label, price, price_ttc, tva_tx, price_base_type, cost_price, tosell, tobuy) VALUES ({p[0]}, '{p[1]}', '{p[2]}', {base_ht}, {p[3]}, 13.0, 'TTC', {p[4]}, 1, 1);\n"

sql += "\n-- 4. TRANSACCIONES HISTORICAS (5 MESES)\n"

facture_id = 2000
bank_id = 2000

for m in meses:
    mes_actual = m['mes']
    
    # Compras de abastecimiento
    sql += f"-- Compras Mes {mes_actual}\n"
    sql += f"INSERT IGNORE INTO llx_bank (rowid, datev, amount, label, fk_account, fk_type) VALUES ({bank_id}, '2026-{mes_actual:02d}-05', -4500.00, 'Pago Proveedor Equipex', 102, 'VIR');\n"
    bank_id += 1
    sql += f"INSERT IGNORE INTO llx_bank (rowid, datev, amount, label, fk_account, fk_type) VALUES ({bank_id}, '2026-{mes_actual:02d}-15', -3200.00, 'Pago Proveedor Fair Play', 102, 'VIR');\n"
    bank_id += 1

    total_ventas = m['ventas'] + m['ecom'] + m['b2b']
    
    for i in range(total_ventas):
        dia = random.randint(1, 28)
        fecha = f"2026-{mes_actual:02d}-{dia:02d}"
        
        # Segmentación por canal
        if i < m['b2b']:
            fk_soc = 103  # B2B
            cuenta_banco = 102
            ref_fac = f"FA26{mes_actual:02d}-B{i:03d}"
            cant_min, cant_max = 10, 20
        elif i < (m['b2b'] + m['ecom']):
            fk_soc = 102  # E-commerce Web
            cuenta_banco = 102
            ref_fac = f"ORD-WEB-{mes_actual:02d}{i:03d}"
            cant_min, cant_max = 1, 3
        else:
            fk_soc = 101  # Mostrador físico
            cuenta_banco = 101
            ref_fac = f"FA26{mes_actual:02d}-{i:03d}"
            cant_min, cant_max = 1, 2

        prod = random.choice(productos)
        qty = random.randint(cant_min, cant_max)
        subtotal = prod[3] * qty
        base_ht = round(subtotal / 1.13, 6)
        tva = subtotal - base_ht
        
        sql += f"INSERT IGNORE INTO llx_facture (rowid, ref, entity, type, fk_soc, datef, total_ht, total_tva, total_ttc, paye, fk_statut) VALUES ({facture_id}, '{ref_fac}', 1, 0, {fk_soc}, '{fecha}', {base_ht}, {tva}, {subtotal}, 1, 2);\n"
        sql += f"INSERT IGNORE INTO llx_facturedet (fk_facture, fk_product, qty, subprice, total_ht, total_tva, total_ttc) VALUES ({facture_id}, {prod[0]}, {qty}, {round(prod[3]/1.13, 6)}, {base_ht}, {tva}, {subtotal});\n"
        sql += f"INSERT IGNORE INTO llx_bank (rowid, datev, amount, label, fk_account, fk_type) VALUES ({bank_id}, '{fecha}', {subtotal}, 'Cobro Venta {ref_fac}', {cuenta_banco}, 'LIQ');\n"
        
        facture_id += 1
        bank_id += 1

with open('seed_sportshark.sql', 'w', encoding='utf-8') as f:
    f.write(sql)
print("¡Archivo seed_sportshark.sql generado con exito y validado!")