# Modelo 09 — Pavimentação · On Track LP

Landing page modelo da **On Track**, feita em **Nuxt 4** (Vue). Sem marca: pronta para personalizar e vender.

- **Demonstração:** https://devagenciaontrack-sys.github.io/lp-modelo-09-ontrack/

## O que tem
- **Simulador de piso** (o recurso próprio deste nicho): a pessoa informa largura e comprimento, escolhe o serviço e o padrão de assentamento — espinha de peixe, fileira corrida ou trama — e o desenho sai na proporção real da área. Quanto maior o terreno, menor a peça aparece. Ao lado, a metragem, a estimativa de peças e um botão que abre o WhatsApp com tudo já escrito.
- Formulário curto no topo (nome, serviço, região e metragem) que também cai no WhatsApp com a mensagem pronta.
- Serviços com o que entra em cada um, etapas da obra da visita à entrega, obras entregues em carrossel, sobre nós, dúvidas e chamada final.
- Botão de WhatsApp fixo no celular.

## Por que o simulador
Pavimentação se vende por metro quadrado, e quase ninguém sabe informar a metragem nem imaginar o resultado. O simulador resolve as duas coisas ao mesmo tempo: a pessoa vê o padrão desenhado e chega no WhatsApp com a medida já calculada, o que encurta a conversa até o orçamento.

A conta usa bloquete de 20 × 10 cm (50 peças por m²), que é o mais comum. Se o cliente trabalha com outra peça, troque `PECA` no topo de `app/components/Piso.vue`.

## Como personalizar
Tudo fica no topo de `app/app.vue`:
- `site`: nome, slogan, WhatsApp, telefone, responsável, cidade, regiões atendidas (viram as opções do formulário), Instagram, CNPJ, ano de início.
- `servicosLista`, `etapas`, `obras`, `duvidas`.
- Cores e fontes: topo de `app/assets/css/main.css` e `nuxt.config.ts`.
- Fotos: os quadros cinza em `obras` e `sobre` são espaços reservados. Troque por `<img>` com as fotos reais da obra — de preferência antes e depois.

## Rodar e publicar
```
npm install
npm run dev        # http://localhost:3000
npm run generate   # site estático em .output/public
```
- **Vercel:** importe o repositório; a Vercel detecta o Nuxt sozinha. Não defina `LP_BASE`.
- **GitHub Pages (demonstração):** `LP_BASE=/lp-modelo-09-ontrack/ npm run generate` e publique `.output/public` no branch `gh-pages`.

## Briefing para o cliente
PDF com tudo o que precisamos do cliente para montar o site: [baixar o briefing](Briefing-Modelo-09-Pavimentacao.pdf?raw=1)

## Prévia ao compartilhar
A imagem `public/og.jpg` aparece quando o link é enviado no WhatsApp ou no Instagram. Em domínio próprio, gere com `LP_URL=https://www.dominio-do-cliente.com.br/` para a prévia apontar para o endereço certo, e troque o `og.jpg` por um print do site final.
