-- Función corregida para activar celda desde el coordinador
-- Busca la franja_id consultando turnos existentes con mismo sector y col_excel

create or replace function public.coordinador_activar_celda(
  p_sector     text,
  p_dia        integer,
  p_col_excel  integer,
  p_mes        date,
  p_persona_id uuid default null
)
returns boolean
language plpgsql
as $$
declare
  v_franja_id integer;
  v_fecha     date;
begin
  v_fecha := make_date(extract(year from p_mes)::int, extract(month from p_mes)::int, p_dia);

  -- Buscar franja_id usando turnos existentes del mismo sector y col_excel
  select t.franja_horaria_id into v_franja_id
  from turnos t
  join franjas_horarias fh on fh.id = t.franja_horaria_id
  join sectores s on s.id = fh.sector_id
  where s.nombre = p_sector
    and t.col_excel = p_col_excel
  limit 1;

  if v_franja_id is null then return false; end if;

  insert into turnos (franja_horaria_id, fecha, col_excel, persona_id, es_titular, origen_vacante)
  values (v_franja_id, v_fecha, p_col_excel, p_persona_id, false, 'coordinador')
  on conflict (franja_horaria_id, fecha) do update
    set persona_id = excluded.persona_id,
        col_excel = excluded.col_excel,
        origen_vacante = 'coordinador',
        asignado_en = case when excluded.persona_id is not null then now() else null end;

  return true;
end;
$$;
