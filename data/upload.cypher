LOAD CSV WITH HEADERS 
FROM 'file:///ship_plan.csv' as rows
WITH rows WHERE rows.code is NOT NULL
MERGE (v:Voyage {code:rows.code, 
        voyage:rows.voy,
        vessel:rows.vessel,
        voyage_status:rows.current_status});

LOAD CSV WITH HEADERS 
FROM 'file:///ship_plan.csv' as rows
WITH rows WHERE rows.status_remark is NOT NULL
MATCH (v:Voyage {code:rows.code})
SET v.voyage_status = rows.status_remark;

LOAD CSV WITH HEADERS 
FROM 'file:///ship_plan.csv' as rows
WITH rows WHERE rows.load_port is NOT NULL
MERGE (p:Port {port_name:rows.load_port});

LOAD CSV WITH HEADERS 
FROM 'file:///ship_plan.csv' as rows
WITH rows WHERE rows.code is NOT NULL
MATCH (p:Port {port_name:rows.load_port})
MATCH (v:Voyage {code:rows.code})
MERGE (o:Order {code:rows.code, 
        order_id:toFloat(id(o)), 
        supplier: rows.supplier,
        species:rows.species,
        terms: rows.terms,
        gmt:toFloat(rows.gmt), 
        qty: toFloat(rows.qty),
        month_lp: date(rows.month_lp)})
MERGE (v)-[:HAS_ORDER]->(o)
MERGE (o)-[r:AT]->(p)
SET r.opening = date(rows.vessel_opening)
SET r.eta_lp = date(rows.eta_lp)
SET r.etb_lp = date(rows.etb_lp)
SET r.etd_lp = date(rows.etd_lp)
SET r.eta_dp = date(rows.eta_rz)
SET r.etb_dp = date(rows.etb_rz)
SET r.etd_dp = date(rows.etd_rz) ;


