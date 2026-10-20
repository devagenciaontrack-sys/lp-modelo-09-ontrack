<script setup lang="ts">
// Calculadora da obra: a pessoa informa a medida, escolhe o serviço e o
// padrão, e recebe a lista de material que a obra vai consumir — junto da
// mensagem de WhatsApp já escrita. É o que ela nunca sabe responder quando
// pede orçamento.
const props = defineProps<{ whatsapp: string }>()

type Peca = 'retangular' | 'sextavado' | 'raquete' | 'ondulado'
type Servico = 'bloquete' | 'calcada' | 'meiofio'

const servico = ref<Servico>('bloquete')
const peca = ref<Peca>('retangular')
const largura = ref(5)
const comprimento = ref(10)

// consumos usuais de obra
const AREIA_M2 = 0.05      // colchão de assentamento, 5 cm
const BASE_M2 = 0.10       // pó de pedra compactado, 10 cm
const CONCRETO_M2 = 0.08   // calçada de 8 cm

const area = computed(() => Math.max(0, largura.value) * Math.max(0, comprimento.value))
const perimetro = computed(() => 2 * (Math.max(0, largura.value) + Math.max(0, comprimento.value)))

const servicos: { id: Servico, n: string }[] = [
  { id: 'bloquete', n: 'Bloquete' },
  { id: 'calcada', n: 'Calçada' },
  { id: 'meiofio', n: 'Meio-fio' },
]

// os formatos que a empresa assenta, com o consumo de cada um
const pecas: { id: Peca, n: string, med: string, m2: number, d: string }[] = [
  { id: 'retangular', n: 'Retangular', med: '20 × 10 cm', m2: 50,
    d: 'O mais comum. Permite espinha de peixe, fileira e trama.' },
  { id: 'sextavado', n: 'Sextavado', med: '25 cm', m2: 16,
    d: 'O clássico das calçadas. Assentamento rápido em área grande.' },
  { id: 'raquete', n: 'Raquete', med: '22 × 11 cm', m2: 40,
    d: 'Encaixe que trava sozinho. Boa saída para estacionamento.' },
  { id: 'ondulado', n: 'Ondulado', med: '22 × 11 cm', m2: 40,
    d: 'Trava nos quatro lados. Indicado onde passa caminhão.' },
]
const pecaAtual = computed(() => pecas.find(p => p.id === peca.value)!)

// lista de material conforme o serviço
type Item = { n: string, v: string, u: string, obs?: string }
const materiais = computed<Item[]>(() => {
  const a = area.value, p = perimetro.value
  if (servico.value === 'meiofio') {
    return [
      { n: 'Meio-fio', v: nf(p), u: 'm', obs: 'peças de 1 metro' },
      { n: 'Peças', v: nf(Math.ceil(p)), u: 'un.' },
      { n: 'Concreto do berço', v: nf(p * 0.03, 2), u: 'm³', obs: 'assentamento da guia' },
    ]
  }
  if (servico.value === 'calcada') {
    return [
      { n: 'Área', v: nf(a, 1), u: 'm²' },
      { n: 'Concreto', v: nf(a * CONCRETO_M2, 2), u: 'm³', obs: 'camada de 8 cm' },
      { n: 'Base compactada', v: nf(a * BASE_M2, 2), u: 'm³', obs: 'pó de pedra' },
      { n: 'Contorno', v: nf(p), u: 'm', obs: 'fôrma ou meio-fio' },
    ]
  }
  return [
    { n: 'Área', v: nf(a, 1), u: 'm²' },
      { n: pecaAtual.value.n, v: nf(Math.ceil(a * pecaAtual.value.m2)), u: 'peças', obs: pecaAtual.value.med },
    { n: 'Areia', v: nf(a * AREIA_M2, 2), u: 'm³', obs: 'colchão de 5 cm' },
    { n: 'Base compactada', v: nf(a * BASE_M2, 2), u: 'm³', obs: 'pó de pedra' },
    { n: 'Meio-fio', v: nf(p), u: 'm', obs: 'contorno do pátio' },
  ]
})

// ── mensagem pronta ──────────────────────────────────────────────────────
const resumo = computed(() => {
  const l = largura.value, c = comprimento.value
  const linhas = [
    'Olá! Quero um orçamento.',
    servico.value === 'bloquete' ? 'Serviço: pavimentação em bloquete.'
      : servico.value === 'calcada' ? 'Serviço: calçada.' : 'Serviço: meio-fio.',
    `Medida: ${l} x ${c} m`
      + (servico.value === 'meiofio' ? ` (${perimetro.value.toFixed(0)} m de contorno).` : ` = ${area.value.toFixed(1)} m².`),
  ]
  if (servico.value === 'bloquete') linhas.push(`Peça: ${pecaAtual.value.n} (${pecaAtual.value.med}).`)
  linhas.push('', 'Estimativa de material:')
  for (const m of materiais.value) linhas.push(`· ${m.n}: ${m.v} ${m.u}`)
  return linhas.join('\n')
})
const link = computed(() => `https://wa.me/${props.whatsapp}?text=${encodeURIComponent(resumo.value)}`)

// hexágonos encaixados, como o bloquete sextavado de calçada
const hexes = (() => {
  const r = 5.4, out: string[] = []
  for (let j = 0; j < 6; j++) {
    for (let i = 0; i < 7; i++) {
      const cx = i * (r * 1.74) - (j % 2 ? r * 0.87 : 0)
      const cy = j * (r * 1.5)
      const p: string[] = []
      for (let k = 0; k < 6; k++) {
        const a = (Math.PI / 180) * (60 * k - 30)
        p.push(`${(cx + Math.cos(a) * (r - 0.4)).toFixed(1)},${(cy + Math.sin(a) * (r - 0.4)).toFixed(1)}`)
      }
      out.push(p.join(' '))
    }
  }
  return out
})()

// raquete: retângulo com um dente de um lado e um encaixe do outro
const raquete = (x: number, y: number) =>
  `M${x} ${y} h11.6 v3 h1.6 v2 h-1.6 v3 h-11.6 v-3 h-1.6 v-2 h1.6 Z`

// ondulado: as duas faces em S que travam a peça
const onda = (x: number, y: number) =>
  `M${x} ${y} q3 1.6 6 0 q3 -1.6 6 0 v6.6 q-3 1.6 -6 0 q-3 -1.6 -6 0 Z`

function nf(v: number, casas = 0) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}
</script>

<template>
  <div class="calc">
    <!-- escolhas -->
    <div class="calc-campos">
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

      <!-- tipos de peça que a empresa trabalha, com o formato real -->
      <div v-if="servico === 'bloquete'" class="campo">
        <span class="rot">Tipo de peça</span>
        <div class="amostras">
          <button v-for="p in pecas" :key="p.id" type="button" :class="{ on: peca === p.id }"
            @click="peca = p.id">
            <svg viewBox="0 0 60 44" aria-hidden="true">
              <rect x="0" y="0" width="60" height="44" class="rejunte" />
              <g v-if="p.id === 'retangular'">
                <g v-for="j in 6" :key="j">
                  <rect v-for="i in 5" :key="i" class="pc"
                    :x="(i - 1) * 14 - (j % 2 ? 7 : 0)" :y="(j - 1) * 7.6" width="13" height="6.6" rx="0.8" />
                </g>
              </g>
              <g v-else-if="p.id === 'sextavado'">
                <polygon v-for="(h, k) in hexes" :key="k" class="pc" :points="h" />
              </g>
              <g v-else-if="p.id === 'raquete'">
                <g v-for="j in 5" :key="j">
                  <path v-for="i in 5" :key="i" class="pc"
                    :d="raquete((i - 1) * 12.5 - (j % 2 ? 6.2 : 0), (j - 1) * 9)" />
                </g>
              </g>
              <g v-else>
                <g v-for="j in 6" :key="j">
                  <path v-for="i in 5" :key="i" class="pc"
                    :d="onda((i - 1) * 13 - (j % 2 ? 6.5 : 0), (j - 1) * 7.6)" />
                </g>
              </g>
            </svg>
            <span><b>{{ p.n }}</b>{{ p.med }}</span>
          </button>
        </div>
        <p class="dica">{{ pecaAtual.d }}</p>
      </div>
      <p v-else-if="servico === 'calcada'" class="dica dica-solta">
        Passeio em concreto entre o seu terreno e a rua, com junta a cada metro e caimento para a água escoar.
      </p>
      <p v-else class="dica dica-solta">
        Guia que separa o passeio da rua, com a sarjeta encostada no asfalto. Cobrado por metro linear.
      </p>
    </div>

    <!-- lista de material -->
    <div class="calc-saida">
      <p class="saida-tit">O que a sua obra consome</p>
      <dl class="lista">
        <div v-for="m in materiais" :key="m.n">
          <dt>{{ m.n }}<small v-if="m.obs">{{ m.obs }}</small></dt>
          <dd>{{ m.v }}<span>{{ m.u }}</span></dd>
        </div>
      </dl>
      <p class="obs">Estimativa pela medida informada, com as sobras usuais de obra. A quantidade final sai na visita técnica.</p>
      <a class="btn btn-laranja btn-bloco" :href="link" target="_blank" rel="noopener"
        data-track="lp_whatsapp_click" data-location="calculadora">
        <svg class="ic-wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.4-1.3A9 9 0 1 0 12 3Z" /></svg>
        Enviar essa lista no WhatsApp
      </a>
    </div>
  </div>
</template>

<style scoped>
.calc{ display:grid; gap:20px; }
.calc > *{ min-width:0; }
.calc-campos, .campo, .opcoes, .medidas, .amostras{ min-width:0; }
@media (min-width:900px){
  .calc{ grid-template-columns:1.05fr .95fr; gap:36px; align-items:start; }
}

.calc-campos{ display:grid; gap:18px; align-content:start; }
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

/* amostras do padrão: o desenho real do assentamento, em miniatura */
.amostras{ display:grid; grid-template-columns:repeat(2, 1fr); gap:9px; }
@media (min-width:520px){ .amostras{ grid-template-columns:repeat(4, 1fr); } }
.amostras button{
  display:grid; gap:8px; padding:8px 8px 10px; cursor:pointer;
  border:1px solid var(--linha); border-radius:12px; background:var(--grafite);
  font:inherit; color:var(--marfim);
  transition:border-color .18s, background-color .18s;
}
.amostras button:hover{ border-color:var(--laranja); }
.amostras button.on{ border-color:var(--laranja); background:rgba(245,158,27,.09); }
.amostras svg{ display:block; width:100%; aspect-ratio:60 / 44; border-radius:7px; overflow:hidden; }
.amostras span{ display:grid; gap:1px; font-size:11px; line-height:1.25;
                text-align:center; color:var(--areia); }
.amostras span b{ font-size:12.5px; font-weight:700; color:var(--marfim); }
.rejunte{ fill:#2A2D34; }
.pc{ fill:#9DA1A9; }
.amostras button.on .pc{ fill:#D3D6DB; }

/* lista de material */
.calc-saida{
  display:grid; gap:0; padding:20px 18px;
  border:1px solid var(--linha); border-radius:16px; background:var(--grafite);
}
.saida-tit{
  margin:0 0 4px; font-family:var(--cond); font-size:21px; font-weight:700;
  letter-spacing:.04em; text-transform:uppercase;
}
.lista{ margin:10px 0 0; }
.lista > div{
  display:flex; align-items:baseline; justify-content:space-between; gap:16px;
  padding-block:13px; border-bottom:1px solid var(--linha);
}
.lista > div:first-child{ border-top:1px solid var(--linha); }
.lista dt{ display:grid; gap:2px; font-size:15px; font-weight:600; }
.lista dt small{ font-size:12.5px; font-weight:400; color:var(--areia); }
.lista dd{ margin:0; font-size:24px; font-weight:800; letter-spacing:-.02em;
           white-space:nowrap; font-variant-numeric:tabular-nums; }
.lista dd span{ margin-left:5px; font-size:13px; font-weight:600; color:var(--areia); }
.obs{ margin:14px 0 16px; font-size:13px; line-height:1.5; color:var(--areia); }
.btn-bloco{ width:100%; }
@media (min-width:520px){ .calc-saida{ padding:24px 22px; } }
</style>
