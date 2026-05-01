project_name: "looker_starter"

application: looker_starter {
  label: "Looker Starter"
  url: "https://example.com/looker-starter"
  entitlements: {
    core_api_methods: ["me"]
  }
}

constant: CONNECTION_NAME {
  value: "your_connection"
  export: override_optional
}
