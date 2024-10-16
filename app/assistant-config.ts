export let assistantId = "asst_7cJE6V1VX7iTUNPDAtDlbs8g"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
