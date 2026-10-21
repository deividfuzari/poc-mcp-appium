// Locators mapeados via appium-mcp (generate_locators + appium_find_element) em 2026-09-11,
// app com.wdiodemoapp v1.0.8. Todos os interativos expõem accessibility id.
export const formsElements = {
  screen_forms: "~Forms-screen",

  field_input: "~text-input",
  text_inputResult: "~input-text-result",

  switch_form: "~switch",
  text_switchState: "~switch-text",
  // O texto do switch é um convite à próxima ação: "turn ON" = switch desligado.
  text_switchOff:
    '//*[@text="Click to turn the switch ON" or @label="Click to turn the switch ON"]',
  text_switchOn:
    '//*[@text="Click to turn the switch OFF" or @label="Click to turn the switch OFF"]',

  btn_dropdown: "~Dropdown",
  // As opções do diálogo nativo não têm accessibility id — só texto.
  // O escopo por CheckedTextView evita casar com o campo que exibe a seleção.
  option_dropdown: (option: any) =>
    `//android.widget.CheckedTextView[@text="${option}" or @label="${option}"]`,
  text_dropdownSelected: (option: any) =>
    `//android.widget.EditText[@resource-id="text_input" and (@text="${option}" or @label="${option}")]`,

  btn_active: "~button-Active",
  btn_inactive: "~button-Inactive",
  text_activeAlert:
    '//*[@text="This button is active" or @label="This button is active"]',
};

export default formsElements;
