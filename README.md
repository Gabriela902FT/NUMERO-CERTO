# Número Certo — Sorteios, Avaliação com IA & Transparência

**Desenvolvedor:** Gabriela Teixeira  
**Plataforma:** Web / Android (PWA & Jetpack Compose Aesthetics)  
**Identidade Visual:** Roxo (#7C3AED / #6D28D9), Violeta (#A855F7) e Turquesa (#06B6D4)  
**Temas Suportados:** Claro e Escuro (com persistência local em `localStorage` e seletor `@custom-variant dark`)  
**Legislação de Referência:** Lei Federal nº 5.768/1971, Decreto nº 70.951/1972 e Portarias da Secretaria de Prêmios e Apostas do Ministério da Fazenda (SPA/MF).

---

## 1. Resumo das Atualizações Recentes

### 1.1 Correção dos Temas Claro e Escuro
- Adição da diretiva `@custom-variant dark (&:where(.dark, .dark *));` no arquivo `src/index.css` para compatibilidade total com Tailwind CSS v4.
- Atualização do `ThemeContext.tsx` para sincronizar classes e atributos `data-theme` tanto na raiz (`<html>`) quanto no `<body>`.
- Assinatura discreta obrigatória no rodapé: **preta no tema claro** e **branca no tema escuro**.

### 1.2 Remoção da Alteração dos Dados do Ganhador
- Removidos todos os campos de texto que permitiam ao organizador alterar ou sobrescrever nome, bilhete ou prêmio do ganhador.
- Os resultados agora são estritamente **leitura imutável**, vinculados ao 1º Prêmio da Loteria Federal.
- Criada a seção e modal de **Imutabilidade e Trilha de Auditoria**, onde retificações materiais legítimas exigem procedimento formal, justificativa gravada, data e responsável, mantendo histórico indelével (protegendo dados com máscara LGPD).

### 1.3 Remoção da Carteira Interna
- Eliminada qualquer dependência de carteira digital interna, depósitos prévios, saques ou saldo fictício para compradores.
- O comprador não precisa cadastrar carteira nem transferir saldo antecipado: a compra é **direta via Pix** para o organizador.

### 1.4 Recebimento via Pix do Organizador
- Adicionada a aba e seção **"Recebimento via Pix"** no painel do organizador.
- Validação em tempo real dos tipos de chave: CPF/CNPJ, E-mail, Celular e Chave Aleatória (EVP).
- Prévia dos dados de pagamento apresentados ao comprador (nome do destinatário, instituição e chave).
- Trava de proteção antifraude: alerta e bloqueio de substituição silenciosa de chave enquanto houver compras pendentes.

### 1.5 Fluxo Simplificado de Compra (Etapas A — D)
- **Etapa A — Escolher os Números:** Seleção na grade de 001 a 1000, cálculo determinístico (`Total = Quantidade × Preço Unitário`) e reserva temporária com cronômetro regressivo de 15 minutos.
- **Etapa B — Pagar via Pix:** Apresentação da chave do organizador, nome do destinatário homologado, valor exato, QR Code dinâmico e código Pix Copia e Cola. Alerta expresso de que abrir a tela não quita o pedido.
- **Etapa C — Enviar Comprovante:** Prioridade para **tirar foto diretamente com a câmera do celular** (`capture="environment"` e visor WebRTC em tempo real), além de seleção na galeria. Leitura de valor declarado e conferência ótica pela IA.
- **Etapa D — Confirmar a Participação:** Estados rigorosos (`PENDING_PAYMENT`, `PROOF_RECEIVED`, `PAYMENT_UNCONFIRMED`, `PAYMENT_CONFIRMED`, `PAYMENT_INSUFFICIENT`, `CONFIRMED`, `EXPIRED`, `CANCELLED`). Simulação de Webhook bancário autenticado para testes ponta a ponta.

### 1.6 Câmera do Celular para Avaliação com IA
- No componente `NumeroCertoAiAssistant.tsx` e no `BuyerCheckoutFlowModal.tsx`, a captura por câmera do celular é a opção primária e destacada, permitindo fotos de produtos e de comprovantes tanto pelo app de câmera nativo do celular quanto pelo visor em tempo real.

### 1.7 Doação / Contribuição Voluntária via Pix (R$ 10,00)
- **100% Opcional & Não Bloqueante:** A contribuição é estritamente voluntária para apoiar a manutenção do app. Não bloqueia funcionalidades, não confere privilégios nem altera chances de sorteio.
- **Convite Amigável & Controle de Frequência:** Mensagem calorosa apresentada de forma não-intrusiva com opções *"Quero contribuir com R$ 10"* e *"Agora não"*. Controle via `localStorage` (intervalo mínimo de 12 horas e opção de desativação permanente).
- **Código Pix Oficial Validado:**
  - Código BR Code padrão EMV / BCB: `00020101021126580014br.gov.bcb.pix0136c123a434-a0ec-4c2b-b88a-b202d1af991e5204000053039865802BR5919GABRIELA F TEIXEIRA6013BELO HORIZON62070503***630403CC`
  - Destinatário: **Gabriela F. Teixeira**
  - Chave Aleatória: `c123a434-a0ec-4c2b-b88a-b202d1af991e`
  - Município: **Belo Horizonte**
- **Transparência Absoluta:** O app não assume quitação automática apenas pelo clique de cópia. Exibe mensagem de orientação: *"Você pode concluir a transferência no aplicativo do seu banco. Obrigado por considerar apoiar o NumeroCerto!"*.

---

## 2. O que foi Implementado vs Simulado

| Funcionalidade | Status | Detalhes Técnicos |
| :--- | :--- | :--- |
| **Suporte aos Temas Claro/Escuro** | **Implementado** | Alternância instantânea via Tailwind v4, classes no HTML/Body e persistência em `localStorage`. |
| **Imutabilidade do Ganhador** | **Implementado** | Remoção de campos editáveis; cards com travas criptográficas e dados mascarados (LGPD). |
| **Grade de Cotas (001 a 1000)** | **Implementado** | Ocupação atômica, paginação, filtros e prevenção de colisões. |
| **Fluxo de Compra Pix (Etapas A-D)** | **Implementado** | Modal `BuyerCheckoutFlowModal` com QR Code, copia e cola, câmera e cronômetro de reserva. |
| **Câmera do Celular (Foto)** | **Implementado** | `<input capture="environment" />` para câmera nativa + visor WebRTC `getUserMedia`. |
| **Doação Voluntária via Pix** | **Implementado** | Modal `DonationModal` com validação de payload EMV BCB (`donationPixValidator.ts`). |
| **Cálculo Determinístico** | **Implementado** | Fórmula pura `Quantidade × Preço Unitário` no frontend e engine. |
| **Trilha de Auditoria com Hashes** | **Implementado** | Histórico cronológico imutável com hashes simulados de integridade. |
| **Conexão Bancária Real / Pix Real** | **Simulado** | O sistema não movimenta dinheiro real; utiliza simulação idempotente de Webhook do PSP. |
| **Autorização Legal SPA/MF** | **Informativo** | Avisos claros de conformidade com a Lei 5.768/1971; publicação real de sorteios desativada. |

---

## 3. Testes Executados

Foram implementadas e executadas duas suítes automatizadas de testes:
1. `tests/purchaseValidation.test.ts` (11 testes):
   - Cálculo aritmético exato de compras de cotas.
   - Suficiência e insuficiência de valores pagos.
   - Concorrência e prevenção de colisão de cotas já atribuídas.
   - Expiração determinística de reservas temporárias após 15 minutos.
   - Transições rigorosas de estados da solicitação de compra.

2. `tests/donationPixValidation.test.ts` (6 testes):
   - Validação da estrutura EMV BCB da chave e payload Pix oficial.
   - Conferência de correspondência com o destinatário Gabriela F. Teixeira.
   - Rejeição de códigos truncados, alterados ou ausentes.

Para executar os testes:
```bash
npm run build
npx tsx tests/purchaseValidation.test.ts
npx tsx tests/donationPixValidation.test.ts
```

---

## 4. Instruções para Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev

# Compilar para produção
npm run build
```
