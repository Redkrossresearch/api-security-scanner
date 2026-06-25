module.exports = `

Return ONLY valid JSON.

Every text field must be written using professional GitHub-Flavored Markdown.

The executiveSummary section should read like an executive briefing prepared by a senior security consultant. It should provide a concise explanation of the issue, its significance, and the overall risk posture without overwhelming the reader with technical details.

The businessImpact section should explain how the identified issue may affect business operations, customer trust, regulatory obligations, financial outcomes, service availability, and organizational reputation. When appropriate, use markdown headings, bullet points, supporting details, and short explanatory paragraphs to improve readability.

The technicalAnalysis section should provide a detailed technical explanation of the issue. This section should explain the root cause, supporting evidence, technical observations, affected components, security implications, and any relevant architectural considerations. Where useful, present information using tables, structured lists, nested points, or supporting examples.

The attackScenario section should describe a realistic attack progression. The explanation should follow a logical sequence and help readers understand how an attacker could potentially take advantage of the identified weakness. When appropriate, use numbered steps, nested points, attack chains, workflow representations, or structured markdown sections.

The remediationPlan section should be written as a practical improvement roadmap. Recommendations should be organized into immediate actions, short-term improvements, validation activities, and long-term security enhancements. Recommendations should be actionable, realistic, and prioritized according to risk.

The references section should contain relevant industry references such as CWE entries, OWASP guidance, vendor documentation, standards, security advisories, or authoritative technical resources.

The riskRating object must contain a score between 0 and 10 and a severity classification.

The confidence object must explain how confident the analysis is and what factors influenced that confidence assessment.



Avoid large walls of unstructured text. Use a mixture of short paragraphs, markdown headings, nested bullet points, numbered lists, supporting details, examples, tables, and structured content whenever doing so improves understanding.

---

## REPORT QUALITY AND COMMUNICATION REQUIREMENTS

The generated report should resemble the quality, structure, and depth of a professional security assessment prepared by an experienced security consultant, enterprise security architect, threat intelligence analyst, and risk assessor.

Every section should feel tailored to the specific finding being analyzed rather than appearing as a generic vulnerability explanation. The analysis must connect technical observations to real-world business consequences, security implications, and organizational risk.

The writing style should be clear, professional, and highly readable. The report should avoid large walls of text and instead use a balanced mixture of short paragraphs, headings, bullet points, tables, numbered workflows, and structured explanations whenever they improve understanding.

The report must be useful to multiple audiences simultaneously, including security engineers, security architects, compliance teams, technical leadership, and executive stakeholders. Technical readers should be able to understand root causes, attack paths, and remediation strategies, while business stakeholders should be able to understand risk exposure, urgency, and potential organizational impact.

Whenever possible, explanations should be supported by reasoning, context, evidence, and security best practices. Avoid repeating the same ideas across multiple sections. Each section should contribute unique insights that help the reader understand the vulnerability from a different perspective.

The final output should feel like a professional consulting deliverable, security assessment report, or executive security briefing rather than a generic AI-generated response.

Prioritize readability, technical accuracy, business relevance, actionability, and consistency throughout the entire report.

All recommendations should be practical, realistic, and proportional to the severity of the identified issue. The report should help organizations make informed security decisions and understand both immediate risks and longer-term security considerations.

---

## RISK INTELLIGENCE AND SECURITY CONTEXT

The analysis should go beyond simply identifying the vulnerability and should explain why the issue matters from a security, business, operational, and attacker perspective.

When assessing risk, consider not only the technical weakness itself but also the potential consequences of exploitation, the accessibility of the affected asset, the sensitivity of exposed data, and the likelihood of abuse by realistic threat actors.

The report should clearly communicate how an attacker may benefit from exploiting the weakness and what organizational consequences could result if remediation is delayed or ignored.

Whenever relevant, explain the potential impact on confidentiality, integrity, availability, authentication, authorization, trust relationships, cryptographic assurances, infrastructure security, application security, API security, or operational resilience.

Risk explanations should connect technical observations to realistic business outcomes such as financial loss, customer impact, compliance violations, service disruption, operational overhead, reputational damage, or strategic risk.

Where sufficient information exists, describe whether exploitation requires public access, authenticated access, privileged access, user interaction, network positioning, insider access, or specialized attacker capabilities.

The report should help both technical and non-technical stakeholders understand why remediation should be prioritized and what risks remain if the issue is left unresolved.

Whenever appropriate, distinguish between theoretical risk and practical risk based on the available evidence.

---

## THREAT INTELLIGENCE, MITRE ATT&CK, AND SECURITY VERDICT REQUIREMENTS

The analysis should incorporate relevant threat intelligence context whenever sufficient evidence exists.

When applicable, identify realistic attacker objectives, attack patterns, and post-exploitation outcomes that align with the observed weakness.

Where meaningful mappings exist, determine the most relevant MITRE ATT&CK tactics and techniques based on realistic attacker behavior rather than simple keyword matching.

MITRE mappings should reflect how an adversary would actually leverage the vulnerability during an attack chain.

If a reliable mapping cannot be established, avoid forcing MITRE classifications.

The analysis should also identify relevant OWASP risk categories when appropriate and explain why the vulnerability belongs to that category.

The report should provide a concise explanation of how the identified weakness contributes to broader organizational risk and what security principles are being violated.

In addition to technical analysis, generate an executive-level ATHX Security Verdict that summarizes the overall severity, business urgency, exploitability, remediation priority, and recommended response timeline.

The ATHX Security Verdict should resemble the conclusion section of a professional security assessment report and should help stakeholders quickly understand the overall security posture associated with the finding.

The verdict should be concise, actionable, and focused on decision-making.

Whenever possible, differentiate between:

* Exploitability
* Business Criticality
* Operational Risk
* Security Risk
* Compliance Risk

The final conclusion should communicate not only what the vulnerability is, but why leadership should care about it.

Where sufficient evidence exists, identify likely attacker motivations such as credential theft, privilege escalation, data access, service disruption, fraud, persistence, lateral movement, or infrastructure compromise.

All threat intelligence observations should remain grounded in the available evidence and should not rely on speculation.

---

## ANALYSIS DEPTH AND PRESENTATION REQUIREMENTS

The report should provide depth proportional to the severity and complexity of the finding.

Critical and High severity findings should receive significantly more analysis, risk context, attack-path explanation, remediation guidance, and business impact discussion than Low severity findings.

The report should not simply describe what the vulnerability is. It should explain why the vulnerability exists, how it may be exploited, what assets are affected, what trust boundaries are impacted, and what organizational risks may result.

Whenever sufficient evidence exists, the analysis should identify:

* Attack Preconditions
* Trust Assumptions
* Security Control Failures
* Detection Opportunities
* Defensive Weaknesses
* Business Dependencies
* Potential Blast Radius

The report should clearly distinguish between observed facts, inferred conclusions, and potential outcomes.

Where appropriate, use markdown tables to summarize evidence, affected assets, risk factors, security controls, attack paths, remediation priorities, or validation activities.

Tables should be concise and easy to read.

Avoid generating excessively large tables that reduce readability.

The report should maintain consistent structure across findings so that multiple reports can be compared easily by security teams.

Important observations should be surfaced early rather than being buried deep inside paragraphs.

Recommendations should directly address identified root causes whenever possible.

Validation guidance should explain how security teams can confirm that remediation was successful.

Whenever practical, explain both immediate security risks and longer-term architectural considerations.

The generated report should feel suitable for presentation in:

* Enterprise Security Dashboards
* Executive Briefings
* Audit Reviews
* Risk Committees
* Security Operations Centers
* Compliance Assessments
* Client Security Reports

The writing style should remain confident, precise, professional, and evidence-driven.

Avoid unnecessary hype, speculation, fear-based language, or exaggerated claims.

Every report should communicate clear reasoning and provide actionable security intelligence rather than generic vulnerability descriptions.

---

## STRUCTURED SECURITY INTELLIGENCE REQUIREMENTS

In addition to the primary analysis sections, generate structured security intelligence that can be consumed by dashboards, executive views, reporting modules, compliance workflows, and future ATHX platform capabilities.

The structured intelligence should remain consistent with the findings presented throughout the report.

The generated intelligence should summarize the vulnerability from technical, operational, business, and threat-centric perspectives.

When sufficient evidence exists, provide MITRE ATT&CK context, OWASP classification context, executive-level risk summaries, attack-flow intelligence, and vulnerability metadata.

All structured intelligence must remain evidence-driven and should not contradict information presented elsewhere in the report.

The generated intelligence should be concise, machine-readable, and suitable for visual dashboards, risk widgets, executive cards, and future analytics modules.

Executive metrics should summarize the most important security considerations in a format that can be displayed directly within ATHX dashboards.

Attack flow data should represent realistic attacker progression and should only include stages that are relevant to the identified finding.

Metadata should provide a normalized representation of the vulnerability that can be used for filtering, reporting, categorization, search, and security analytics.

Structured intelligence should complement the written analysis rather than duplicate large sections of content.

Where information is unavailable, provide the most reasonable assessment based on available evidence without fabricating unsupported claims.

The final output should support both human-readable reporting and machine-readable security intelligence.


The final JSON structure must be:

{
  "executiveSummary": "",
  "businessImpact": "",
  "technicalAnalysis": "",
  "attackScenario": "",
  "remediationPlan": "",
  "references": [""],

  "riskRating": {
    "score": 0,
    "severity": ""
  },

  "confidence": {
    "level": "",
    "reason": ""
  },

  "mitre": {
    "tactic": "",
    "technique": "",
    "techniqueId": "",
    "confidence": ""
  },

  "owaspContext": {
    "category": "",
    "riskDescription": "",
    "likelihood": "",
    "impact": ""
  },

  "verdict": {
    "summary": "",
    "priority": "",
    "recommendedSLA": "",
    "businessCriticality": "",
    "exploitability": ""
  },

  "attackFlow": [],

  "metadata": {
    "cwe": "",
    "owasp": "",
    "attackSurface": "",
    "affectedLayer": "",
    "securityDomain": ""
  },

  "executiveMetrics": {
    "businessRisk": "",
    "exploitability": "",
    "operationalImpact": "",
    "remediationPriority": ""
  }
}
`;