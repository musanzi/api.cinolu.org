## Context

Implement an **AI Coach module** in the application.

Technical constraints:

- Use **LangGraph** for orchestration. It is already installed.
- Use the locally available **llama3.2:3b** model.
- Keep the implementation clean, modular, and extensible.

## Business idea

There are two main actors:

### Admin

The admin manages AI coaches:

- name
- profile
- roles
- expected outputs

### User

The user:

- owns one or more ventures
- can chat with an AI coach about a specific venture

The coach must respond based only on:

- its configured profile
- its configured role
- its configured expected outputs
- the context of the selected venture

## Core rules

- An AI coach is fully defined by its **name**, **profile**, **roles**, and **expected outputs**.
- Only admins can create, update, or manage AI coaches.
- Users cannot manage coach definitions. They can only interact with available coaches.
- A user must be able to discuss a specific venture with coach.
- The coach must stay strictly within its configured scope.
- The coach must never answer outside its profile, roles, expected outputs, or venture context.
- Coach responses must be predictable, structured, and aligned with the configured output types.

## Functional requirements

1. **Admin coach management**
   - Create AI coaches
   - Update AI coaches
   - View AI coaches
   - Define for each coach:
     - name
     - profile
     - roles
     - expected outputs

2. **Coach assignment / usage**
   - A coach can be used in the context of a user venture.
   - The system must support venture-based conversations with coaches.

3. **Venture-based discussion**
   - A user can select one of their ventures and chat with a coach about it.
   - The coach must use the venture context when generating responses.
   - The coach must remain limited to its own configuration while discussing the venture.

4. **Output enforcement**
   - Each coach has explicit expected outputs.
   - The system must enforce that generated responses match those expected outputs.
   - Do not allow broad generic assistant behavior.

## Deliverables

Implement:

- AI Coach module
- admin CRUD for coaches
- coach configuration model
- venture-aware conversation flow
- response/output enforcement logic

Also provide a frontend integration guide in a markdown file.
