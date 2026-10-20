<script setup lang="ts">
// Simulador de obra: desenha o serviço escolhido no tamanho que a pessoa
// informa e calcula metragem, peças e meio-fio. No fim monta a mensagem do
// WhatsApp já preenchida, que é o que o pedreiro precisa receber.
const props = defineProps<{ whatsapp: string }>()

type Padrao = 'espinha' | 'fileira' | 'trama'
type Servico = 'bloquete' | 'calcada' | 'meiofio'

const servico = ref<Servico>('bloquete')
const padrao = ref<Padrao>('espinha')
const largura = ref(5)
const comprimento = ref(10)

// bloquete comum: 20 x 10 cm → 50 peças por metro quadrado
const PECA = { c: 0.2, l: 0.1 }
const area = computed(() => Math.max(0, largura.value) * Math.max(0, comprimento.value))
const pecas = computed(() => Math.ceil(area.value / (PECA.c * PECA.l)))
const perimetro = computed(() => 2 * (Math.max(0, largura.value) + Math.max(0, comprimento.value)))

const servicos: { id: Servico, n: string }[] = [
  { id: 'bloquete', n: 'Bloquete' },
  { id: 'calcada', n: 'Calçada' },
  { id: 'meiofio', n: 'Meio-fio' },
]
const padroes: { id: Padrao, n: string, d: string }[] = [
  { id: 'espinha', n: 'Espinha de peixe', d: 'Trava melhor sob peso. Indicado para entrada de carro.' },
  { id: 'fileira', n: 'Fileira corrida', d: 'Assentamento mais rápido. Comum em calçada e quintal.' },
  { id: 'trama', n: 'Trama', d: 'Desenho em xadrez. Boa saída para área de lazer.' },
]
const padraoAtual = computed(() => padroes.find(p => p.id === padrao.value)!)

// ── desenho ──────────────────────────────────────────────────────────────
// O quadro tem 300 x 200 unidades. A peça é desenhada na proporção real da
// área informada, então 3 x 4 m mostra bloquete grande e 20 x 30 m, pequeno.
const Q = { w: 300, h: 200 }

const escala = computed(() => {
  const l = Math.max(1, largura.value), c = Math.max(1, comprimento.value)
  return Math.min(Q.w / c, Q.h / l)
})

type Peca = { x: number, y: number, w: number, h: number, r: number }

const pecasBloquete = computed<Peca[]>(() => {
  const e = escala.value
  const cw = PECA.c * e   // comprimento da peça no desenho
  const ch = PECA.l * e   // largura da peça no desenho
  if (cw < 2) return []   // área grande demais: vira textura, não peça
  const out: Peca[] = []
  const folga = 0.9       // deixa o rejunte aparecer

  if (padrao.value === 'fileira') {
    const linhas = Math.ceil(Q.h / ch) + 1
    for (let i = 0; i < linhas; i++) {
      const y = i * ch
      const desloca = i % 2 ? cw / 2 : 0
      for (let x = -cw; x < Q.w + cw; x += cw) {
        out.push({ x: x + desloca, y, w: cw * folga, h: ch * folga, r: 0 })
      }
    }
  } else if (padrao.value === 'trama') {
    const lado = cw
    for (let j = 0; j * lado < Q.h + lado; j++) {
      for (let i = 0; i * lado < Q.w + lado; i++) {
        const x = i * lado, y = j * lado
        if ((i + j) % 2 === 0) {
          out.push({ x, y, w: cw * folga, h: ch * folga, r: 0 })
          out.push({ x, y: y + ch, w: cw * folga, h: ch * folga, r: 0 })
        } else {
          out.push({ x, y, w: ch * folga, h: cw * folga, r: 0 })
          out.push({ x: x + ch, y, w: ch * folga, h: cw * folga, r: 0 })
        }
      }
    }
  } else {
    // espinha de peixe: fileiras de peças inclinadas, alternando o sentido
    const passo = cw * Math.SQRT1_2
    const filas = Math.ceil(Q.h / passo) + 2
    for (let i = -1; i < filas; i++) {
      const y = i * passo
      const sentido = i % 2 === 0 ? -45 : 45
      const desloca = i % 2 === 0 ? 0 : passo / 2
      for (let x = -cw; x < Q.w + cw; x += passo) {
        out.push({ x: x + desloca, y, w: cw * folga, h: ch * folga, r: sentido })
      }
    }
  }
  return out
})

// juntas da calçada e emendas do meio-fio: uma a cada metro da obra
const marcas = computed(() => {
  const passo = Math.max(16, escala.value)
  const out: number[] = []
  for (let x = passo; x < Q.w; x += passo) out.push(x)
  return out
})

// ── mensagem pronta ──────────────────────────────────────────────────────
const nomeServico = computed(() =>
  servico.value === 'bloquete' ? 'pavimentação em bloquete'
    : servico.value === 'calcada' ? 'calçada' : 'meio-fio')

const resumo = computed(() => {
  const l = largura.value, c = comprimento.value
  if (servico.value === 'meiofio') {
    return `Olá! Quero orçamento de meio-fio.\nPerímetro aproximado: ${perimetro.value.toFixed(0)} metros (área de ${l} x ${c} m).`
  }
  return `Olá! Quero orçamento de ${nomeServico.value}.\n`
    + `Medida aproximada: ${l} x ${c} m = ${area.value.toFixed(1)} m².\n`
    + (servico.value === 'bloquete'
      ? `Padrão de assentamento: ${padraoAtual.value.n}.\nEstimativa de peças: ${pecas.value.toLocaleString('pt-BR')}.`
      : `Contorno aproximado: ${perimetro.value.toFixed(0)} metros.`)
})
const link = computed(() => `https://wa.me/${props.whatsapp}?text=${encodeURIComponent(resumo.value)}`)

const legenda = computed(() =>
  servico.value === 'bloquete' ? padraoAtual.value.n
    : servico.value === 'calcada' ? 'Calçada entre o terreno e a rua'
      : 'Guia, sarjeta e passeio')

const nf = (v: number, casas = 0) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
</script>

<template>
  <div class="piso">
    <!-- escolhas -->
    <div class="piso-campos">
      <div class="campo">
        <span class="rot">O que você precisa</span>
        <div class="opcoes">
          <button v-for="s in servicos" :key="s.id" type="button" :class="{ on: servico === s.id }"
            @click="servico = s.id">{{ s.n }}</button>
        </div>
      </div>

      <div class="campo medidas">
        <label class="med">
          <span class="rot">Largura</span>
          <span class="entrada">
            <input v-model.number="largura" type="number" inputmode="decimal" min="1" max="200" step="0.5">
            <i>m</i>
          </span>
        </label>
        <label class="med">
          <span class="rot">Comprimento</span>
          <span class="entrada">
            <input v-model.number="comprimento" type="number" inputmode="decimal" min="1" max="200" step="0.5">
            <i>m</i>
          </span>
        </label>
      </div>

      <div v-if="servico === 'bloquete'" class="campo">
        <span class="rot">Padrão de assentamento</span>
        <div class="opcoes">
          <button v-for="p in padroes" :key="p.id" type="button" :class="{ on: padrao === p.id }"
            @click="padrao = p.id">{{ p.n }}</button>
        </div>
        <p class="dica">{{ padraoAtual.d }}</p>
      </div>
      <p v-else-if="servico === 'calcada'" class="dica dica-solta">
        Passeio em concreto entre o seu terreno e a rua, com junta a cada metro e caimento para a água escoar.
      </p>
      <p v-else class="dica dica-solta">
        Guia que separa o passeio da rua, com a sarjeta encostada no asfalto. Cobrado por metro linear.
      </p>
    </div>

    <!-- desenho -->
    <figure class="piso-quadro">
      <svg :viewBox="`0 0 ${Q.w} ${Q.h}`" preserveAspectRatio="xMidYMid slice" role="img"
        :aria-label="`Desenho de ${legenda} na medida informada`">
        <defs>
          <clipPath id="recorte"><rect x="0" y="0" :width="Q.w" :height="Q.h" /></clipPath>
        </defs>
        <rect x="0" y="0" :width="Q.w" :height="Q.h" fill="#1A1C21" />

        <g clip-path="url(#recorte)">
          <!-- ── BLOQUETE: o pátio inteiro assentado no padrão escolhido ── -->
          <template v-if="servico === 'bloquete'">
            <rect x="0" y="0" :width="Q.w" :height="Q.h" fill="#2A2D34" />
            <rect v-for="(p, i) in pecasBloquete" :key="i"
              :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="0.6"
              :transform="p.r ? 'rotate(' + p.r + ' ' + (p.x + p.w / 2) + ' ' + (p.y + p.h / 2) + ')' : undefined"
              :class="['pc', i % 7 === 0 ? 'v1' : i % 5 === 0 ? 'v2' : '']" />
            <text v-if="!pecasBloquete.length" :x="Q.w / 2" :y="Q.h / 2" class="aviso">
              área grande · desenho fora de escala
            </text>
            <rect x="0" y="0" :width="Q.w" :height="Q.h" fill="none" stroke="#C9CDD6" stroke-width="7" />
          </template>

          <!-- ── CALÇADA: terreno em cima, passeio no meio, rua embaixo ── -->
          <template v-else-if="servico === 'calcada'">
            <rect x="0" y="0" :width="Q.w" height="36" fill="#3C4A33" />
            <rect x="0" y="31" :width="Q.w" height="5" fill="#4A5B35" />
            <rect x="0" y="36" :width="Q.w" :height="Q.h - 76" fill="#BABEC5" />
            <rect x="0" y="36" :width="Q.w" height="3" fill="#CED2D8" />
            <rect v-for="m in marcas" :key="'j' + m" :x="m" y="36" width="1.6"
              :height="Q.h - 76" fill="#9DA2AB" />
            <rect x="0" :y="Q.h - 40" :width="Q.w" height="12" fill="#E2E5EA" />
            <rect x="0" :y="Q.h - 28" :width="Q.w" height="28" fill="#24262B" />
            <rect x="0" :y="Q.h - 28" :width="Q.w" height="2" fill="#3A3D44" />
            <text x="9" y="21" class="rot-cena">terreno</text>
            <text x="9" :y="Q.h - 31" class="rot-cena esc">guia</text>
            <text x="9" :y="Q.h - 9" class="rot-cena">rua</text>
          </template>

          <!-- ── MEIO-FIO: passeio, topo da guia, face, sarjeta e asfalto ── -->
          <template v-else>
            <rect x="0" y="0" :width="Q.w" height="76" fill="#BABEC5" />
            <rect v-for="m in marcas" :key="'p' + m" :x="m" y="0" width="1.4" height="76" fill="#A6ABB3" />
            <rect x="0" y="76" :width="Q.w" height="18" fill="#E6E9ED" />
            <rect x="0" y="94" :width="Q.w" height="42" fill="#C4C8CF" />
            <rect v-for="m in marcas" :key="'g' + m" :x="m" y="76" width="2.2" height="60" fill="#A2A7AF" />
            <rect x="0" y="132" :width="Q.w" height="4" fill="#8E939B" />
            <rect x="0" y="136" :width="Q.w" height="20" fill="#D2D6DC" />
            <rect x="0" y="156" :width="Q.w" :height="Q.h - 156" fill="#24262B" />
            <rect x="0" y="156" :width="Q.w" height="2" fill="#3A3D44" />
            <text x="9" y="21" class="rot-cena esc">passeio</text>
            <text x="9" y="150" class="rot-cena esc">sarjeta</text>
            <text x="9" :y="Q.h - 9" class="rot-cena">rua</text>
          </template>
        </g>
      </svg>
      <figcaption>{{ legenda }} · {{ nf(largura, 1) }} × {{ nf(comprimento, 1) }} m</figcaption>
    </figure>

    <!-- conta -->
    <div class="piso-conta">
      <dl>
        <div><dt>Área</dt><dd>{{ nf(area, 1) }} <span>m²</span></dd></div>
        <div v-if="servico === 'bloquete'"><dt>Peças</dt><dd>{{ nf(pecas) }} <span>un.</span></dd></div>
        <div v-else-if="servico === 'meiofio'"><dt>Meio-fio</dt><dd>{{ nf(perimetro) }} <span>m</span></dd></div>
        <div v-else><dt>Contorno</dt><dd>{{ nf(perimetro) }} <span>m</span></dd></div>
      </dl>
      <p class="obs">
        {{ servico === 'bloquete'
          ? 'Estimativa para bloquete de 20 × 10 cm. A medida final sai na visita técnica.'
          : 'Estimativa pela medida informada. A medida final sai na visita técnica.' }}
      </p>
      <a class="btn btn-laranja btn-bloco" :href="link" target="_blank" rel="noopener"
        data-track="lp_whatsapp_click" data-location="simulador">
        <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
        Enviar essa medida no WhatsApp
      </a>
    </div>
  </div>
</template>

<style scoped>
.piso{ display:grid; gap:18px; }
/* item de grid não encolhe sozinho: sem isto a fila de botões estica a coluna */
.piso > *{ min-width:0; }
.piso-campos, .campo, .opcoes, .medidas, .piso-conta dl{ min-width:0; }
.piso-conta dl{ flex-wrap:wrap; }
@media (min-width:980px){
  .piso{ grid-template-columns:1fr 1.15fr; grid-template-rows:auto auto; gap:24px 32px; align-items:start; }
  .piso-campos{ grid-row:1 }
  .piso-quadro{ grid-column:2; grid-row:1 / span 2 }
  .piso-conta{ grid-row:2 }
}

.piso-campos{ display:grid; gap:18px; align-content:start; }
.campo{ display:grid; gap:9px; }
.rot{ font-family:var(--cond); font-size:13px; font-weight:700; letter-spacing:.14em;
      text-transform:uppercase; color:var(--areia); }

.opcoes{ display:flex; flex-wrap:wrap; gap:8px; }
.opcoes button{
  flex:1 1 84px; min-width:0; min-height:46px; padding:11px 10px;
  border:1px solid var(--linha); border-radius:10px; background:var(--grafite);
  font:inherit; font-size:14.5px; font-weight:600; color:var(--marfim); cursor:pointer;
  transition:border-color .18s, background-color .18s, color .18s;
}
.opcoes button:hover{ border-color:var(--laranja); }
.opcoes button.on{ background:var(--laranja); border-color:var(--laranja); color:#17120A; }
.opcoes button:focus-visible{ outline:2px solid var(--laranja); outline-offset:2px; }

.medidas{ grid-template-columns:1fr 1fr; gap:10px; }
.med{ display:grid; gap:9px; min-width:0; }
.entrada{ display:flex; align-items:center; gap:5px; padding:0 10px; min-width:0;
          border:1px solid var(--linha); border-radius:10px; background:var(--grafite); }
.entrada input{
  width:100%; min-width:0; padding:12px 0; border:0; background:none;
  font:inherit; font-size:19px; font-weight:700; color:var(--marfim);
}
.entrada input:focus{ outline:none; }
.entrada:focus-within{ border-color:var(--laranja); }
.entrada i{ font-style:normal; font-size:14px; color:var(--areia); }
.dica{ margin:0; font-size:13.5px; line-height:1.45; color:var(--areia); }
.dica-solta{ padding-top:2px; }

.piso-quadro{ margin:0; }
.piso-quadro svg{ display:block; width:100%; aspect-ratio:3 / 2; border-radius:12px;
                  background:#1A1C21; }
.pc{ fill:#8E9099; }
.pc.v1{ fill:#7C7E87; }
.pc.v2{ fill:#9B9DA6; }
.aviso{ fill:var(--areia); font-size:11px; text-anchor:middle; }
.rot-cena{ fill:#EDEFF2; font-size:9px; font-weight:700; letter-spacing:.14em;
           text-transform:uppercase; opacity:.8; }
.rot-cena.esc{ fill:#2A2D34; opacity:.75; }
.piso-quadro figcaption{ margin-top:10px; font-size:13.5px; color:var(--areia); }

.piso-conta dl{ display:flex; gap:28px; margin:0 0 12px; }
.piso-conta dt{ font-family:var(--cond); font-size:13px; font-weight:700; letter-spacing:.14em;
                text-transform:uppercase; color:var(--areia); }
.piso-conta dd{ margin:4px 0 0; font-size:34px; font-weight:800; line-height:1;
                letter-spacing:-.03em; color:var(--marfim); }
.piso-conta dd span{ font-size:15px; font-weight:600; color:var(--areia); }
.obs{ margin:0 0 16px; font-size:13px; line-height:1.5; color:var(--areia); }
.btn-bloco{ width:100%; }
</style>
