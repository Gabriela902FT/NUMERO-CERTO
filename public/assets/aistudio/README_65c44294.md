# NumeroCerto — Android starter (modo demonstração)

Projeto inicial Android em Kotlin + Jetpack Compose para uma plataforma de sorteios com números de 001 a 1000.

## Estado real deste pacote
- Inclui interface inicial, grade de números, formulário demonstrativo de sorteio e área de transparência.
- Usa somente dados locais/fictícios em memória.
- **Não** tem backend, login real, verificação de CPF/CNPJ, pagamentos, publicação de sorteios, API da Loteria Mineira ou apuração oficial integrada.
- Não foi compilado nem testado neste ambiente. Compile no Android Studio antes de usar.

## Requisitos
- Android Studio recente
- JDK 17
- Android SDK instalado pelo Android Studio

## Abrir
1. Extraia o ZIP.
2. Abra a pasta `NumeroCerto` no Android Studio.
3. Aguarde a sincronização do Gradle.
4. Execute no emulador ou aparelho Android.

Se o Android Studio sugerir atualizar o Gradle/Android Gradle Plugin, faça isso pelo assistente e confira os erros antes de publicar.

## Estrutura
- `app/src/main/java/br/com/numerocerto/MainActivity.kt`: interface Compose e navegação simples.
- `app/src/main/AndroidManifest.xml`: configuração básica.
- `legal/ROTEIRO_REGULATORIO.md`: checklist de pontos a confirmar.
- `legal/RODAPE_MODELO.md`: texto transparente para o rodapé.

## Limites legais e de produto
O aplicativo fica em **modo demonstração**. Os botões não vendem números, não recebem dinheiro e não criam sorteios públicos. Antes de ativar qualquer modalidade com venda de números ou prêmios, obtenha orientação formal sobre o enquadramento legal, autorização aplicável, responsabilidades da plataforma e de cada organizador. CPF/CNPJ informado pelo usuário não substitui autorização.

Não use nome, logotipo ou linguagem que sugira parceria com a Loteria Mineira antes de haver autorização formal verificável. Quando existir documento autorizativo, publique somente a parte que puder ser divulgada, com link verificável e sem dados pessoais/confidenciais.


## Etapa 2 — rascunhos locais
- Os rascunhos agora são salvos em SharedPreferences no aparelho e reaparecem ao reabrir o app.
- É possível consultar e excluir rascunhos.
- Dados são locais, sem conta, sem sincronização e sem backup na nuvem.
- Não use dados pessoais reais nesta etapa.
- Teste manual sugerido: criar rascunho, fechar e reabrir o app, verificar se aparece; excluir e confirmar que some.


## Etapa 3 — regras legíveis e simulador ilustrativo de taxa
- Adicionadas telas demonstrativas de regras claras e simulação de taxa.
- As regras usam fonte legível, seções separadas para organizador/participante e explicação do fluxo em caso de descumprimento.
- O simulador usa valores digitados localmente; não é uma IA, não consulta pagamentos e não processa cobrança.
- A tabela de taxa no simulador é apenas ilustrativa. Não deve ser usada para cobrança real.
- Nenhuma venda, publicação, pagamento ou sorteio final foi ativado.
- Leia `legal/REGRAS_DESCUMPRIMENTO_E_TAXA.md`.
- Não compilado nem testado nesta etapa; revisar e compilar no Android Studio antes de uso.


## Etapa 4 — cadastro demonstrativo do organizador
- Adicionada tela para pessoa física ou pessoa jurídica/entidade.
- Campos de demonstração: nome/razão social, CPF/CNPJ em texto, endereço, telefone e e-mail opcional.
- Validação local de preenchimento e comprimento do documento; não valida CPF/CNPJ de verdade, não consulta bases oficiais e não verifica identidade.
- Dados ficam apenas na memória da tela durante a sessão: não são enviados nem persistidos. Não use dados pessoais reais.
- O status não afirma que a identidade está verificada e distingue explicitamente identidade de autorização legal.
- A publicação, vendas, pagamentos e sorteio final continuam desativados.
- Esta etapa não foi compilada nem testada no Android Studio.


## Etapa 5 — temas claro/escuro e assinatura do desenvolvedor
- Barra superior com opções explícitas “Claro” e “Escuro”. A preferência é salva localmente no aparelho.
- Rodapé com “Desenvolvedor: Gabriela Teixeira”, em fonte pequena porém legível; branco no tema escuro e preto no tema claro.
- Incluído `design/NumeroCerto_mockup_visual.png` como referência visual e `PROMPT_GOOGLE_AI_STUDIO.md` para orientar o Google AI Studio.
- O mockup é uma referência de design, não uma captura de telas já implementadas.
- Esta etapa não foi compilada nem testada no Android Studio.
- O ZIP é um projeto Android Kotlin/Jetpack Compose; Google AI Studio pode usá-lo como referência/prompt, mas não se deve presumir que importe e compile diretamente um projeto Android nativo.
