# Implementation Guidelines

- For every new feature, add or update tests in the root `test` folder.
- Do not generate migrations unless explicitly requested.
- Do not use one module’s repository inside another module.
- When data or behavior from another module is needed, import and use that module’s service instead.
- If the service does not yet expose the required method, add the method to that service rather than accessing its repository directly.
