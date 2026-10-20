# Modelo 09 — Pavimentação · On Track LP

Landing page modelo da **On Track**, feita em **Nuxt 4** (Vue). Sem marca: pronta para personalizar e vender.

- **Demonstração:** https://devagenciaontrack-sys.github.io/lp-modelo-09-ontrack/

## O que tem
- Topo com a marca e botão de orçamento, e um formulário curto no primeiro quadro: nome, serviço, região e metragem. Ao enviar, abre o WhatsApp com a mensagem já escrita.
- **Obras entregues** em carrossel. É a seção que responde "o que fazemos": no lugar de descrever o serviço em texto, as fotos mostram.
- Como funciona, da visita à entrega, em cinco etapas.
- Sobre nós, dúvidas frequentes em sanfona e chamada final.
- Botão de WhatsApp fixo no celular.

## Sobre as fotos
Os quadros cinza em **Obras entregues** e em **Sobre** são espaços reservados. Troque pelas fotos reais, de preferência com antes e depois, que é o que mais convence neste serviço. A legenda de cada obra leva a metragem e o padrão, por exemplo "80 m² · espinha de peixe".

## Como personalizar
Tudo fica no topo de `app/app.vue`:
- `site`: nome, slogan, WhatsApp, telefone, responsável, cidade, regiões atendidas (viram as opções do formulário), Instagram, CNPJ, ano de início.
- `etapas`, `obras`, `duvidas`.
- Cores e fontes: topo de `app/assets/css/main.css` e `nuxt.config.ts`.

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
