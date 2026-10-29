# Cadastro de organizador — especificação da Etapa 4

## Campos previstos
- Tipo: pessoa física ou pessoa jurídica/entidade.
- Nome completo ou razão social.
- CPF ou CNPJ, conforme o tipo de cadastro.
- Endereço para contato/verificação.
- Telefone de contato.
- E-mail opcional, conforme decisão do produto.
- Aceite explícito do aviso de privacidade.

## Estado da implementação
A tela é apenas uma demonstração visual e valida preenchimento/comprimento. Não valida matematicamente CPF/CNPJ, não confirma identidade, não consulta bases oficiais, não transmite dados e não persiste os campos. Não inserir dados reais nesta versão.

## Requisitos antes de produção
1. Fazer análise de finalidade e necessidade para cada dado, conforme LGPD.
2. Decidir quais dados são realmente necessários para cada modalidade de organizador; não presumir que todos os campos são obrigatórios para todos.
3. Definir base legal, aviso de privacidade, canal para direitos do titular, retenção e descarte.
4. Implementar backend com controle de acesso, criptografia em trânsito e em repouso, registro de acesso, limitação de tentativas e proteção contra abuso.
5. Não armazenar cópias de documentos indiscriminadamente nem expor CPF, endereço, telefone ou documentos em páginas públicas.
6. Usar fornecedor especializado se houver necessidade de validação documental; verificar contrato, segurança, retenção e localização dos dados.
7. Manter status separados: cadastro preenchido, identidade verificada, documentos analisados e autorização legal verificada.
8. Não permitir publicação pública até que a modalidade e a autorização aplicável sejam confirmadas.
9. O aceite dos termos não elimina direitos legais nem transfere automaticamente toda a responsabilidade para o organizador.
