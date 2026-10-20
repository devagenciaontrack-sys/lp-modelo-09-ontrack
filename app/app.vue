<script setup lang="ts">
// ============ PERSONALIZAÇÃO ============
const site = {
  marca: 'Sua Pavimentação',
  slogan: 'Bloquete · Meio-fio · Calçada',
  whatsapp: '5500000000000',
  telefone: '(00) 00000-0000',
  responsavel: 'Nome do responsável',
  cidade: 'Sua cidade/UF',
  regioes: ['Região 1', 'Região 2', 'Região 3', 'Região 4', 'Toda a cidade'],
  instagram: '#',
  cnpj: '00.000.000/0000-00',
  desde: '0000',
}
const base = useRuntimeConfig().app.baseURL
const wa = (msg = 'Olá! Gostaria de um orçamento de pavimentação.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`

// ── formulário rápido do topo ──
const nome = ref('')
const servico = ref('')
const regiao = ref('')
const metragem = ref('')
const servicos = ['Bloquete', 'Meio-fio', 'Calçada', 'Mais de um']

const linkTopo = computed(() => {
  const l: string[] = ['Olá! Quero um orçamento.']
  if (nome.value) l.push(`Meu nome: ${nome.value}.`)
  if (servico.value) l.push(`Serviço: ${servico.value}.`)
  if (regiao.value) l.push(`Região: ${regiao.value}.`)
  if (metragem.value) l.push(`Metragem aproximada: ${metragem.value}.`)
  return wa(l.join('\n'))
})

const etapas = [
  { n: 'Visita', d: 'Vamos até a obra, medimos e vemos o estado do solo. Sem custo.' },
  { n: 'Orçamento', d: 'Você recebe o valor fechado por escrito, com prazo e o que está incluso.' },
  { n: 'Preparo', d: 'Escavação, compactação e nivelamento da base. É aqui que a obra dura ou não.' },
  { n: 'Assentamento', d: 'Peça por peça, no padrão escolhido, com o rejunte e a compactação final.' },
  { n: 'Entrega', d: 'Limpeza da área e vistoria junto com você antes de encerrar.' },
]

const obras = [
  { t: 'Entrada de garagem', m: '00 m² · espinha de peixe' },
  { t: 'Pátio de empresa', m: '000 m² · fileira corrida' },
  { t: 'Calçada residencial', m: '00 m · concreto' },
  { t: 'Meio-fio de condomínio', m: '000 m lineares' },
  { t: 'Estacionamento', m: '000 m² · bloquete' },
  { t: 'Área de lazer', m: '00 m² · trama' },
]

const duvidas = [
  { q: 'Quanto tempo leva uma obra dessas?', a: 'Depende da metragem e do estado do solo. Uma entrada de garagem comum costuma sair em dois a três dias. O prazo vai por escrito no orçamento, antes de começar.' },
  { q: 'Preciso comprar o material?', a: 'Não precisa. O orçamento já vem com material e mão de obra. Se você já tiver o bloquete, a gente desconta e cobra só o serviço.' },
  { q: 'O bloquete afunda com o tempo?', a: 'Afunda quando a base foi mal preparada. Por isso a compactação do solo é a etapa mais demorada do serviço, mesmo sem aparecer no resultado final.' },
  { q: 'Dá para passar carro pesado em cima?', a: 'Dá. Para caminhão ou carreta usamos bloquete de espessura maior e assentamento em espinha de peixe, que trava melhor sob carga.' },
  { q: 'Vocês emitem nota fiscal?', a: 'Sim. Trabalhamos com CNPJ e emitimos nota para pessoa física e jurídica.' },
  { q: 'Atendem fora da cidade?', a: 'Atendemos a região toda. Para obra mais distante entra uma taxa de deslocamento, informada antes de fechar.' },
]

const aberta = ref(0)
</script>

<template>
  <div>
    <a class="pular" href="#conteudo">Pular para o conteúdo</a>

    <header class="topo">
      <div class="wrap topo-in">
        <a href="#" class="marca" translate="no">
          <span class="marca-ic" aria-hidden="true">
            <svg viewBox="0 0 32 32"><g fill="currentColor"><rect x="4" y="7" width="10" height="7" rx="1.2" /><rect x="17" y="7" width="10" height="7" rx="1.2" /><rect x="4" y="17" width="10" height="7" rx="1.2" /><rect x="17" y="17" width="10" height="7" rx="1.2" /></g></svg>
          </span>
          <span class="marca-txt"><b>{{ site.marca }}</b><small>{{ site.slogan }}</small></span>
        </a>
        <a class="tel" :href="`tel:${site.telefone.replace(/\D/g, '')}`">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6.5 3Z" /></svg>
          <span>{{ site.telefone }}</span>
        </a>
        <a class="btn btn-laranja btn-p topo-cta" :href="wa()" target="_blank" rel="noopener"
          data-track="lp_whatsapp_click" data-location="topo">
          <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
          <span class="topo-cta-l">Pedir orçamento</span>
          <span class="topo-cta-c">Orçamento</span>
        </a>
      </div>
    </header>

    <main id="conteudo">
      <!-- ══════════ TOPO ══════════ -->
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-txt">
            <p class="chapeu">Serviço em {{ site.cidade }}</p>
            <h1>Pavimentação em <em>bloquete</em>, meio-fio e calçada</h1>
            <p class="hero-sub">Peça o orçamento pelo WhatsApp. Diga o serviço, o endereço e a metragem aproximada — a gente responde com o valor fechado.</p>
            <div class="hero-acoes">
              <a class="btn btn-laranja btn-g" :href="wa()" target="_blank" rel="noopener"
                data-track="lp_whatsapp_click" data-location="hero">
                <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
                Chamar no WhatsApp
              </a>
              <a class="btn btn-linha btn-g" :href="`tel:${site.telefone.replace(/\D/g, '')}`">Ligar agora</a>
            </div>
            <ul class="selos">
              <li>Visita e orçamento sem custo</li>
              <li>Valor fechado por escrito</li>
              <li>Material e mão de obra</li>
            </ul>
          </div>

          <!-- formulário curto, igual ao que o cliente vê no anúncio -->
          <form class="orc" @submit.prevent>
            <h2 class="orc-tit">Pedir orçamento</h2>
            <p class="orc-sub">Três respostas rápidas. Você cai no WhatsApp com a mensagem pronta.</p>

            <label class="orc-c">
              <span class="rot">Seu nome</span>
              <input v-model="nome" type="text" name="nome" autocomplete="name" placeholder="Como podemos te chamar?">
            </label>

            <div class="orc-c">
              <span class="rot">O que você precisa?</span>
              <div class="orc-ops">
                <button v-for="s in servicos" :key="s" type="button" :class="{ on: servico === s }"
                  @click="servico = s">{{ s }}</button>
              </div>
            </div>

            <label class="orc-c">
              <span class="rot">Onde fica a obra?</span>
              <select v-model="regiao" name="regiao">
                <option value="">Escolha a região</option>
                <option v-for="r in site.regioes" :key="r" :value="r">{{ r }}</option>
              </select>
            </label>

            <label class="orc-c">
              <span class="rot">Metragem aproximada <i>(se souber)</i></span>
              <input v-model="metragem" type="text" name="metragem" inputmode="decimal"
                placeholder="Ex.: 80 m² ou 25 metros de meio-fio">
            </label>

            <a class="btn btn-laranja btn-bloco" :href="linkTopo" target="_blank" rel="noopener"
              data-track="lp_whatsapp_click" data-location="form_topo">
              <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
              Enviar pelo WhatsApp
            </a>
            <p class="orc-pe">Prefere falar agora?
              <a :href="`tel:${site.telefone.replace(/\D/g, '')}`">{{ site.telefone }}</a>
            </p>
          </form>
        </div>
      </section>

      <!-- ══════════ OBRAS ══════════ -->
      <!-- As fotos fazem o papel da antiga lista de serviços: mostram o que
           a empresa faz em vez de descrever. TODO: trocar os quadros pelas
           fotos reais, de preferência com antes e depois. -->
      <section id="obras" class="sec obras-sec">
        <div class="wrap">
          <div class="cab">
            <p class="chapeu">O que fazemos</p>
            <h2>Obras entregues</h2>
            <p class="cab-sub arraste">Arraste para o lado para ver mais</p>
          </div>
          <div class="obras">
            <figure v-for="(o, i) in obras" :key="o.t" :class="`ob o${i % 3}`">
              <div class="ob-ph"><span>Foto da obra</span></div>
              <figcaption><b>{{ o.t }}</b><span>{{ o.m }}</span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- ══════════ ETAPAS ══════════ -->
      <section id="como" class="sec etapas-sec">
        <div class="wrap">
          <div class="cab">
            <p class="chapeu">Como funciona</p>
            <h2>Da visita à entrega</h2>
          </div>
          <ol class="etapas">
            <li v-for="(e, i) in etapas" :key="e.n">
              <span class="et-n">{{ String(i + 1).padStart(2, '0') }}</span>
              <div><b>{{ e.n }}</b><p>{{ e.d }}</p></div>
            </li>
          </ol>
        </div>
      </section>

      <!-- ══════════ SOBRE ══════════ -->
      <section id="sobre" class="sec sobre">
        <div class="wrap sobre-grid">
          <div class="sobre-ph"><span>Foto da equipe ou do maquinário</span></div>
          <div class="sobre-txt">
            <p class="chapeu">Quem faz o serviço</p>
            <h2>Equipe própria, não terceirizada</h2>
            <p>A {{ site.marca }} trabalha com equipe fixa desde {{ site.desde }}. Quem passa no orçamento é quem acompanha a obra, então o combinado não se perde no caminho.</p>
            <p>A gente prefere explicar o porquê de cada etapa a empurrar serviço. Se o seu caso pede outra solução, a gente fala antes.</p>
            <dl class="fichas">
              <div><dt>Desde</dt><dd>{{ site.desde }}</dd></div>
              <div><dt>Atendimento</dt><dd>{{ site.cidade }}</dd></div>
              <div><dt>Responsável</dt><dd>{{ site.responsavel }}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <!-- ══════════ DÚVIDAS ══════════ -->
      <section id="duvidas" class="sec">
        <div class="wrap">
          <div class="cab">
            <p class="chapeu">Antes de fechar</p>
            <h2>Perguntas que sempre chegam</h2>
          </div>
          <div class="fq">
            <details v-for="(d, i) in duvidas" :key="d.q" :open="i === aberta">
              <summary>
                {{ d.q }}
                <span class="fq-sinal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></span>
              </summary>
              <p>{{ d.a }}</p>
            </details>
          </div>
        </div>
      </section>

      <!-- ══════════ CHAMADA FINAL ══════════ -->
      <section class="final">
        <div class="wrap final-in">
          <h2>Manda a medida que a gente te passa o valor</h2>
          <p>Atendimento de segunda a sábado. Visita e orçamento sem custo em {{ site.cidade }}.</p>
          <div class="final-acoes">
            <a class="btn btn-laranja btn-g" :href="wa()" target="_blank" rel="noopener"
              data-track="lp_whatsapp_click" data-location="final">
              <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
              Pedir orçamento
            </a>
            <a class="btn btn-linha btn-g" :href="`tel:${site.telefone.replace(/\D/g, '')}`">{{ site.telefone }}</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="rodape">
      <div class="wrap rodape-in">
        <div>
          <a href="#" class="marca" translate="no">
            <span class="marca-ic" aria-hidden="true">
              <svg viewBox="0 0 32 32"><g fill="currentColor"><rect x="4" y="7" width="10" height="7" rx="1.2" /><rect x="17" y="7" width="10" height="7" rx="1.2" /><rect x="4" y="17" width="10" height="7" rx="1.2" /><rect x="17" y="17" width="10" height="7" rx="1.2" /></g></svg>
            </span>
            <span class="marca-txt"><b>{{ site.marca }}</b><small>{{ site.slogan }}</small></span>
          </a>
          <p class="rod-cnpj">CNPJ {{ site.cnpj }} · {{ site.cidade }}</p>
        </div>
        <nav class="rod-links" aria-label="Seções">
          <a href="#como">Como funciona</a>
          <a href="#obras">Obras</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <div class="rod-cta">
          <a class="btn btn-laranja btn-p" :href="wa()" target="_blank" rel="noopener"
            data-track="lp_whatsapp_click" data-location="rodape">Falar no WhatsApp</a>
          <a class="rod-tel" :href="`tel:${site.telefone.replace(/\D/g, '')}`">{{ site.telefone }}</a>
        </div>
      </div>
      <p class="rod-fim">
        <a class="rod-credito" href="https://www.ontrackagenciadigital.com.br" target="_blank" rel="noopener">
          Site feito pela <b>On Track</b>
        </a>
      </p>
    </footer>

    <!-- botão fixo no celular -->
    <a class="flutua" :href="wa()" target="_blank" rel="noopener" aria-label="Falar no WhatsApp"
      data-track="lp_whatsapp_click" data-location="flutuante">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
    </a>
  </div>
</template>
