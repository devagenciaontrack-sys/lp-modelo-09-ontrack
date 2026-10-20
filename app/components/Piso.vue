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

    <!-- vista 3D da obra -->
    <figure class="piso-quadro">
      <Obra3D :servico="servico" :padrao="padrao" :largura="largura" :comprimento="comprimento" />
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
