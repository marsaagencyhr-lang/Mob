connection: "@{CONNECTION_NAME}"

include: "/views/*.view.lkml"
include: "/dashboards/*.dashboard.lookml"

datagroup: sales_default_datagroup {
  sql_trigger: SELECT MAX(updated_at) FROM orders ;;
  max_cache_age: "1 hour"
}

persist_with: sales_default_datagroup

explore: orders {
  label: "Orders"
  description: "Order-level facts joined to users and products."

  join: users {
    type: left_outer
    relationship: many_to_one
    sql_on: ${orders.user_id} = ${users.id} ;;
  }

  join: products {
    type: left_outer
    relationship: many_to_one
    sql_on: ${orders.product_id} = ${products.id} ;;
  }
}

explore: users {
  label: "Users"
  description: "User dimension with lifetime metrics."
}
