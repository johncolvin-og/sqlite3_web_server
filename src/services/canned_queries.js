export { canned_queries };

function fmt_time_pretty(col_name) {
  return `datetime(${col_name} / 1000000000, 'unixepoch')`;
}

// Each trading day begins at 9pm UTC (5pm ET)
const TRADE_START_HOURS = 21;

function get_trade_start_date() {
  const trade_start = new Date();
  if (trade_start.getUTCHours() <= TRADE_START_HOURS) {
    trade_start.setDate(trade_start.getDate() - 1);
  }
  trade_start.setHours(17);
  trade_start.setMinutes(0);
  trade_start.setSeconds(0);
  trade_start.setMilliseconds(0);
  return trade_start.toISOString();
}

const canned_queries = {
  shot_outcomes: () => `select
    ${fmt_time_pretty('ts')} as Timestamp,
    param3 as EID,
    param1 as PID,
    param2 as Side,
    param4 as Price,
    param5 as PNL,
    param6 as Qty,
    param7 as Clean,
    param8 as Forced,
    param9 as 'Dur ns'
    from log_entry where
      entry_type='shot_outcome'
      order by ts DESC`,
  all_sniper_states: () => `select
    ${fmt_time_pretty('ts')} as Timestamp,
    param1 as Name,
    param2 as Polys,
    param3 as State,
    param4 as Wkg,
    param5 as Fire,
    param6 as Clean,
    param7 as Force,
    param8 as 'Edge Pass',
    param9 as 'Gate 1 Fail',
    param10 as 'Gate 2 Fail',
    param11 as 'Gate 3 Fail',
    param12 as 'Bk Upd',
    param13 as 'Bk Proc Avg',
    param14 as 'Bk Upd Rate'
    from log_entry where
      entry_type='sniper_state'
      order by ts DESC`,
};

canned_queries['sniper_states'] = () =>
  `${canned_queries['all_sniper_states']()} limit 120`;

canned_queries['sniper_state'] = () =>
  `${canned_queries['all_sniper_states']()} limit 1`;

canned_queries['day_shot_outcomes'] = () =>
  `select * from (${canned_queries[
    'shot_outcomes'
  ]()}) where Timestamp>'${get_trade_start_date()}'`;
