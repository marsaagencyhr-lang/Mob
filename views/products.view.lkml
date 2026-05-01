view: products {
  sql_table_name: public.products ;;

  dimension: id {
    primary_key: yes
    type: number
    sql: ${TABLE}.id ;;
  }

  dimension: name {
    type: string
    sql: ${TABLE}.name ;;
  }

  dimension: category {
    type: string
    sql: ${TABLE}.category ;;
  }

  dimension: list_price {
    type: number
    value_format_name: usd
    sql: ${TABLE}.list_price ;;
  }

  measure: count {
    type: count
    drill_fields: [id, name, category]
  }
}
