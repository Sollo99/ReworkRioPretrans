# RioPretrans Rework

Protótipo acadêmico da disciplina de Interação Humano-Computador da FATEC Rio Preto. O portal ajuda a descobrir qual ônibus pegar a partir do destino e permite consultar horários e informações dos cartões.

## Abrir o projeto

O site usa HTML, CSS e JavaScript. Não há dependências nem etapa de build. Para experimentar a versão local a partir da raiz do projeto:

```powershell
python -m http.server 8000
```

Abra [o protótipo local](http://localhost:8000/). O cache offline exige HTTPS ou localhost. Abra o site online uma vez e aguarde o service worker assumir o controle antes de testar offline. Use a mesma aba ou recarregue a página se necessário. Para publicar o site em uma subpasta, mantenha a estrutura dos arquivos e os caminhos relativos.

## Roteiro de demonstração

| Passos da Atividade 8 | Tela e ação |
| --- | --- |
| 1–3 | Abra [a página inicial](index.html?passos=1&hora=07:00). Use “Para onde você vai?”, “Horário da minha linha” ou “Cartão”. |
| 4–7 | Na busca, digite “Bady” e selecione “Bady Bassitt”. Para demonstrar o erro 6a, digite “Hospital de Base” ou “Bady Basit”. Corrija o texto ou escolha a sugestão parecida para mostrar o passo 6b. |
| 8–9 | Em “De onde você sai?”, confirme “Minha localização” para simular uma saída do Terminal Central. |
| 9a | Em [Planejar viagem](planejar.html?passos=1&destino=bernardino%20de%20campos), marque “Digitar de onde saio” e selecione Bady Bassitt. A linha 85 atende esse sentido. |
| 10–11 | Escolha “Buscar linhas” e observe “Buscando linhas…”. |
| 11a–11d | Abra [a simulação de falha](planejar.html?passos=1&simular=sem-conexao&destino=bady%20bassitt), escolha “Buscar linhas” e tente de novo. Para a outra saída, recarregue, repita e cancele. O destino aparece em Recentes. |
| 12a–12c | Use [a simulação sem cobertura](planejar.html?passos=1&simular=sem-linha&destino=bady%20bassitt). Escolha “Mudar o destino” ou confira o link de atendimento. Sem simulação, Bady Bassitt como destino e Bernardino de Campos como origem também acionam essa tela. |
| 13–15 | Em “Rota pronta”, leia a linha, o embarque, os horários e onde descer. Teste [o feriado](planejar.html?passos=1&simular=feriado&destino=bady%20bassitt&origem=minha-localizacao) ou [o fim do dia](horarios.html?linha=406&hora=23:50). |
| 14a–14b | Use “Outras opções” na rota de Bady Bassitt e escolha outra linha. A confirmação volta com a nova linha. |
| 16–17 | Salve a rota, abra [Minhas rotas](minhas-rotas.html?passos=1), reabra a rota offline e, se quiser, remova-a. “Enviar pelo WhatsApp” abre uma mensagem editável. “Avisar onde descer” demonstra o aviso. |
| 18 | Confira a linha, o embarque e o horário na confirmação. A tarefa termina ali mesmo se não quiser guardar a rota. |

Parâmetros de demonstração: `passos=1` mostra os passos, `hora=HH:MM` fixa a hora da consulta e `simular` aceita `sem-conexao`, `sem-linha` e `feriado`, separados por vírgula.

## Dados e decisões do grupo

- Os dados do portal foram capturados em 15/10/2026. Os horários podem sofrer alterações. A consulta usa as ruas cadastradas nos itinerários e as partidas da linha. O quadro não fornece coordenadas, o ponto exato em cada rua ou horários de passagem por ponto.
- “Minha localização” simula o Terminal Central. As alternativas são ordenadas pela próxima partida disponível. O botão “Cartão” abre a página de recarga.
- O número entre parênteses identifica grupos do quadro oficial. O significado de cada grupo ainda precisa de confirmação.
- Complete a lista de feriados municipais em `assets/dados-util.js`, os lugares em `assets/lugares.js` e os avisos em `assets/avisos.js` somente com informações verificadas. A lista vazia de avisos descreve o conteúdo do protótipo. Para comunicados atuais, use o link do portal oficial.
- Fale Conosco e o aviso de desembarque são simulados. O WhatsApp, os sistemas externos e as demais páginas de terceiros precisam de conexão.
- Salvar rotas, Recentes, tema e tamanho da letra usa o armazenamento do navegador. O cache mantém as páginas do próprio protótipo disponíveis offline. Ao publicar uma alteração, atualize a versão do cache em `sw.js`.

