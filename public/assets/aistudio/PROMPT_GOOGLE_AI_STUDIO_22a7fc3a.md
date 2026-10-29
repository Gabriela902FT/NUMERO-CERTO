# Prompt para Google AI Studio — NumeroCerto Sorteios

Use este documento e `design/NumeroCerto_mockup_visual.png` como referência visual e de requisitos. Preserve o nome **NumeroCerto — Sorteios** e a identidade visual roxo/violeta com detalhes verde-menta.

## Objetivo
Criar uma interface responsiva, clara e acessível para uma plataforma de sorteios, com telas de boas-vindas, lista/descoberta, criação de rascunho, perfil privado de organizador, regras, transparência, seleção demonstrativa de números, resultado demonstrativo e configurações.

## Tema
- Oferecer escolha explícita entre **Tema claro** e **Tema escuro** nas configurações e na barra superior.
- Salvar a preferência de tema no dispositivo e reaplicá-la ao reabrir.
- Tema claro: fundo claro, texto escuro.
- Tema escuro: fundo escuro, texto claro.
- Rodapé fixo ao final das telas: `Desenvolvedor: Gabriela Teixeira`; pequeno, porém legível, branco no tema escuro e preto no tema claro.
- Não esconder regras importantes em letras pequenas. Texto de regras com tamanho confortável, contraste e espaçamento.

## Cadastro e privacidade
- Permitir escolher pessoa física ou pessoa jurídica/entidade.
- Campos previstos: nome/razão social, CPF/CNPJ, endereço, telefone e e-mail opcional.
- Tratar esses dados como privados; nunca os mostrar na página pública.
- Separar status de cadastro, identidade verificada e autorização legal.
- Não declarar identidade verificada sem integração real com verificador; não fingir validação de CPF/CNPJ.
- Minimizar dados e definir finalidade, retenção, segurança e direitos do titular conforme LGPD.

## Regras e segurança
- Mostrar regras separadas para organizador e participante, com texto grande.
- Registrar versão e horário do aceite; explicar que aceite não elimina direitos legais.
- Em descumprimento: bloquear antes de publicar; após publicar, poder suspender/ocultar para análise; preservar evidências relevantes com acesso restrito; permitir resposta/contestação; aplicar medidas proporcionais.
- Não exigir IMEI como requisito padrão.
- A responsabilidade não pode ser declarada exclusivamente do organizador sem considerar obrigações legais da plataforma.

## Estado legal e pagamentos
- Não ativar venda real de números, cobrança, publicação pública ou sorteio final até o enquadramento jurídico e autorizações aplicáveis serem confirmados.
- Não tratar troca de nome de “rifa” para “sorteio” como regularização automática.
- Taxa de serviço apenas como simulação até definição jurídica e tabela transparente.
- Nunca inventar integração com pagamentos, validação de identidade, IA operacional ou autorização oficial.

## Entrega técnica solicitada
Gere o código completo, organizado, com instruções de execução e lista explícita do que foi e não foi testado. Não afirme que foi compilado, publicado ou integrado sem realmente executar e confirmar. Se o ambiente produzir aplicação web, explique que isso não é o mesmo que um APK Android nativo.
