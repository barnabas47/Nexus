from backend.channels.adapter import BaseChannelAdapter, AgentResponse, ChannelPayload

class SESAdapter(BaseChannelAdapter):
    """Adapter for Amazon SES rich HTML email templates."""
    def adapt(self, response: AgentResponse, recipient: str) -> ChannelPayload:
        subject = response.metadata.get("subject", "NexusAI Enterprise Platform - Update")
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #0A0A0F; color: #F8FAFC; margin: 0; padding: 24px; }}
    .card {{ background: #12121A; border: 1px solid #232338; border-radius: 12px; padding: 24px; max-width: 600px; margin: auto; }}
    .logo {{ color: #6366F1; font-weight: bold; font-size: 20px; margin-bottom: 16px; }}
    .content {{ line-height: 1.6; color: #94A3B8; font-size: 15px; }}
    .btn {{ display: inline-block; background: #6366F1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; font-weight: 600; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 12px; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">NexusAI Enterprise</div>
    <div class="content">
      <p>{response.text_content}</p>
    </div>
    <a href="https://nexusai.aws.internal/portal" class="btn">Open Unified Admin Portal</a>
    <div class="footer">
      Sent automatically via Amazon SES & Amazon Bedrock AgentCore.
    </div>
  </div>
</body>
</html>
        """.strip()

        payload = {
            "type": "ses_email",
            "source": "onboarding@nexusai.enterprise.aws",
            "destination": {"ToAddresses": [recipient]},
            "message": {
                "Subject": {"Data": subject},
                "Body": {
                    "Html": {"Data": html_body},
                    "Text": {"Data": response.text_content}
                }
            }
        }

        return ChannelPayload(
            channel="ses",
            recipient=recipient,
            payload=payload,
            preview_text=f"[Amazon SES Email] Subject: {subject} | {response.text_content[:60]}..."
        )
