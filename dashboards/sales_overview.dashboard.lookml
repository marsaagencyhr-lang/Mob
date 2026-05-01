- dashboard: sales_overview
  title: Sales Overview
  layout: newspaper
  preferred_viewer: dashboards-next
  description: "High-level sales KPIs and trends."

  filters:
  - name: date_range
    title: Date Range
    type: date_filter
    default_value: "30 days"
    allow_multiple_values: true
    required: false

  - name: country
    title: Country
    type: field_filter
    default_value: ""
    allow_multiple_values: true
    required: false
    model: sales
    explore: orders
    field: users.country

  elements:
  - title: Total Revenue
    name: total_revenue
    model: sales
    explore: orders
    type: single_value
    fields: [orders.total_revenue]
    listen:
      date_range: orders.created_date
      country: users.country
    row: 0
    col: 0
    width: 8
    height: 4

  - title: Orders
    name: order_count
    model: sales
    explore: orders
    type: single_value
    fields: [orders.count]
    listen:
      date_range: orders.created_date
      country: users.country
    row: 0
    col: 8
    width: 8
    height: 4

  - title: Average Order Value
    name: aov
    model: sales
    explore: orders
    type: single_value
    fields: [orders.average_order_value]
    listen:
      date_range: orders.created_date
      country: users.country
    row: 0
    col: 16
    width: 8
    height: 4

  - title: Revenue Over Time
    name: revenue_trend
    model: sales
    explore: orders
    type: looker_line
    fields: [orders.created_date, orders.total_revenue]
    sorts: [orders.created_date desc]
    listen:
      date_range: orders.created_date
      country: users.country
    row: 4
    col: 0
    width: 24
    height: 8

  - title: Top Products by Revenue
    name: top_products
    model: sales
    explore: orders
    type: looker_bar
    fields: [products.name, orders.total_revenue]
    sorts: [orders.total_revenue desc]
    limit: 10
    listen:
      date_range: orders.created_date
      country: users.country
    row: 12
    col: 0
    width: 12
    height: 8

  - title: Revenue by Country
    name: revenue_by_country
    model: sales
    explore: orders
    type: looker_map
    fields: [users.country, orders.total_revenue]
    listen:
      date_range: orders.created_date
    row: 12
    col: 12
    width: 12
    height: 8
