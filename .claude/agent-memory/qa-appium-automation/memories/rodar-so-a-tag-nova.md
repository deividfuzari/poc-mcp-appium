---
name: rodar-so-a-tag-nova
description: Ao encerrar uma automação, rodar apenas a tag dos cenários novos — nunca test:poc nem npm test, que são comandos do usuário
metadata:
  type: feedback
---

# Encerrar a automação rodando só a tag nova

Ao terminar uma automação eu executo **somente** a tag dos cenários que criei ou alterei
(`npm run test:tags '<tag nova>'`). Não rodo `npm run test:poc`, não rodo `npm test` e não rodo a
tag de outra tela para "conferir regressão".

**Why:** cada execução de suíte cria uma sessão Appium nova e reentra na tela uma vez por cenário
pelo `Before`. Rodar a POC inteira para validar um cenário novo custa minutos de emulador e tokens
sem trazer nenhuma informação sobre o que acabou de ser escrito. Instrução do usuário em
2026-09-14, substituindo qualquer briefing anterior que pedisse `test:poc`.

**How to apply:** vale no fechamento de toda automação. Se eu quiser provar que o cenário é
independente de estado, repito **a própria tag nova**, não a suíte. Se eu suspeitar de verdade de
regressão em outra spec (por exemplo, mexi em `base.page`), eu **relato e sugiro o comando** —
quem decide rodar a suíte completa é o usuário. Registrado também no `skills.md`, seção _Running_.

Relacionado: [[lint-fix-sem-eslint-config]] (mesma lógica de escopo — formato só nos arquivos que
eu toquei, nunca o repo inteiro).
