view: orders {
  sql_table_name: public.orders ;;

  dimension: id {
    primary_key: yes
    type: number
    sql: ${TABLE}.id ;;
  }

  dimension: user_id {
    type: number
    hidden: yes
    sql: ${TABLE}.user_id ;;
  }

  dimension: product_id {
    type: number
    hidden: yes
    sql: ${TABLE}.product_id ;;
  }

  dimension: status {
    type: string
    sql: ${TABLE}.status ;;
  }

  dimension_group: created {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year]
    sql: ${TABLE}.created_at ;;
  }

  dimension_group: updated {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year]
    sql: ${TABLE}.updated_at ;;
  }

  dimension: amount {
    type: number
    value_format_name: usd
    sql: ${TABLE}.amount ;;
  }

  measure: count {
    type: count
    drill_fields: [id, status, users.name, products.name, amount]
  }

  measure: total_revenue {
    type: sum
    sql: ${amount} ;;
    value_format_name: usd
    drill_fields: [id, users.name, amount]
  }

  measure: average_order_value {
    type: average
    sql: ${amount} ;;
    value_format_name: usd
  }

  measure: distinct_customers {
    type: count_distinct
    sql: ${user_id} ;;
  }
}
