# N8N Tool Workflows for NexAgent

This document explains how to set up n8n workflows for each tool that agents can use.

## TOOL WORKFLOW PATTERN

Each n8n workflow for a tool should follow this pattern:

1. **Trigger**: Webhook POST at the tool's webhookPath
2. **Process**: Extract parameters from request body
3. **Execute**: Call the real service (Calendar, Email, etc.)
4. **Respond**: Return `{ success: true, message: "Done" }`

## REQUIRED WORKFLOWS

### 1. Book Appointment (`webhook/tool-book-appointment`)

**Purpose**: Book meetings in Google Calendar

**Webhook**: POST `/webhook/tool-book-appointment`

**Request Body**:
```json
{
  "tool": "book_appointment",
  "parameters": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "date": "2024-03-15",
    "time": "14:30",
    "notes": "Initial consultation"
  },
  "context": {
    "clientId": "uuid",
    "agentId": "uuid",
    "businessName": "Business Name"
  },
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

**n8n Setup**:
1. **Manual Trigger** → Webhook → `/webhook/tool-book-appointment`
2. **Google Calendar Node** → Create Event
3. **Response** → Return success message

**Response**:
```json
{
  "success": true,
  "message": "Appointment booked for John Doe on March 15, 2024 at 2:30 PM"
}
```

### 2. Send Email (`webhook/tool-send-email`)

**Purpose**: Send emails via Gmail SMTP

**Webhook**: POST `/webhook/tool-send-email`

**Request Body**:
```json
{
  "tool": "send_email",
  "parameters": {
    "to_email": "customer@example.com",
    "subject": "Appointment Confirmation",
    "body": "Your appointment is confirmed for..."
  }
}
```

**n8n Setup**:
1. **Manual Trigger** → Webhook → `/webhook/tool-send-email`
2. **Gmail Node** → Send Email
3. **Response** → Return success message

### 3. Create Lead (`webhook/tool-create-lead`)

**Purpose**: Save leads to Supabase database

**Webhook**: POST `/webhook/tool-create-lead`

**Request Body**:
```json
{
  "tool": "create_lead",
  "parameters": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "interest": "Premium Plan",
    "priority": "high"
  }
}
```

**n8n Setup**:
1. **Manual Trigger** → Webhook → `/webhook/tool-create-lead`
2. **Supabase Node** → Insert Row
3. **Response** → Return success message

### 4. Check Availability (`webhook/tool-check-availability`)

**Purpose**: Check Google Calendar for open slots

**Webhook**: POST `/webhook/tool-check-availability`

**Request Body**:
```json
{
  "tool": "check_availability",
  "parameters": {
    "date": "2024-03-15",
    "time": "14:30"
  }
}
```

**n8n Setup**:
1. **Manual Trigger** → Webhook → `/webhook/tool-check-availability`
2. **Google Calendar Node** → Get Events
3. **Response** → Return availability status

### 5. Send Quote (`webhook/tool-send-quote`)

**Purpose**: Send price quotes via email

**Webhook**: POST `/webhook/tool-send-quote`

**Request Body**:
```json
{
  "tool": "send_quote",
  "parameters": {
    "customer_email": "customer@example.com",
    "customer_name": "John Doe",
    "service": "Premium Plan",
    "price": "$299/month"
  }
}
```

### 6. Escalate to Human (`webhook/tool-escalate`)

**Purpose**: Send urgent notifications to team

**Webhook**: POST `/webhook/tool-escalate`

**Request Body**:
```json
{
  "tool": "escalate_to_human",
  "parameters": {
    "reason": "Customer needs immediate assistance",
    "customer_name": "John Doe",
    "urgency": "high"
  }
}
```

**n8n Setup**:
1. **Manual Trigger** → Webhook → `/webhook/tool-escalate`
2. **Telegram/Slack Node** → Send Notification
3. **Response** → Return success message

### 7. Lookup Order (`webhook/tool-lookup-order`)

**Purpose**: Check order status or customer info

**Webhook**: POST `/webhook/tool-lookup-order`

**Request Body**:
```json
{
  "tool": "lookup_order",
  "parameters": {
    "order_id": "ORD-12345",
    "customer_email": "customer@example.com"
  }
}
```

## STUB WORKFLOWS (For Testing)

For now, create basic workflows that:
1. Receive webhook
2. Log the received data
3. Return `{ success: true, message: "Done" }`

This allows the system to work even before real integrations are connected.

## WEBHOOK BASE URL CONFIGURATION

Set your n8n webhook base URL in environment variables:

```
N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com
```

All tool webhooks will be called at:
`{N8N_WEBHOOK_BASE_URL}/{webhookPath}`

## SECURITY NOTES

1. **Authentication**: Consider adding API key validation
2. **Rate Limiting**: Implement rate limits per tool
3. **Logging**: Log all tool executions for audit trail
4. **Error Handling**: Always return structured error responses

## TESTING

Test each workflow by sending requests to the webhook URLs:

```bash
curl -X POST https://your-n8n.com/webhook/tool-book-appointment \
  -H "Content-Type: application/json" \
  -d '{"tool":"book_appointment","parameters":{"customer_name":"Test"}}'
```

## NEXT STEPS

1. Set up all webhook workflows in n8n
2. Configure N8N_WEBHOOK_BASE_URL in NexAgent
3. Test each tool individually
4. Monitor n8n execution logs
5. Set up production integrations (Google Calendar, Gmail, etc.)
