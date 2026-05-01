view: users {
  sql_table_name: public.users ;;

  dimension: id {
    primary_key: yes
    type: number
    sql: ${TABLE}.id ;;
  }

  dimension: name {
    type: string
    sql: ${TABLE}.name ;;
  }

  dimension: email {
    type: string
    sql: ${TABLE}.email ;;
  }

  dimension: country {
    type: string
    map_layer_name: countries
    sql: ${TABLE}.country ;;
  }

  dimension_group: signed_up {
    type: time
    timeframes: [raw, date, week, month, year]
    sql: ${TABLE}.signed_up_at ;;
  }

  measure: count {
    type: count
    drill_fields: [id, name, email, country]
  }
}
