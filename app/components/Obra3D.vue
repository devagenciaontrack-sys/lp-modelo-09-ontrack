<script setup lang="ts">
// Vista 3D da obra. Desenha o serviço escolhido no tamanho informado:
// o pátio de bloquete no padrão de assentamento, a calçada entre o terreno
// e a rua, ou o meio-fio com a guia e a sarjeta. Arraste para girar.
// Carrega o Three.js só quando o quadro entra na tela.
const props = withDefaults(defineProps<{
  servico: 'bloquete' | 'calcada' | 'meiofio'
  padrao: 'espinha' | 'fileira' | 'trama'
  largura: number
  comprimento: number
}>(), { servico: 'bloquete', padrao: 'espinha', largura: 5, comprimento: 10 })

const caixa = ref<HTMLElement | null>(null)
const carregado = ref(false)
let montar = () => {}
let redesenhar = () => {}
let destruir = () => {}

// medidas reais, em metros
const PECA = { c: 0.2, l: 0.1, e: 0.08 }   // bloquete
const GUIA = { l: 0.15, h: 0.3, c: 1 }     // meio-fio pré-moldado
const TETO = 7000                           // limite de peças desenhadas

async function iniciar() {
  const el = caixa.value
  if (!el || carregado.value) return
  carregado.value = true
  const THREE = await import('three')
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches

  const render = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  render.toneMapping = THREE.ACESFilmicToneMapping
  render.toneMappingExposure = 1.05
  // uma única luz com sombra, mapa de 1024: o suficiente para dar
  // volume sem pesar no celular
  render.shadowMap.enabled = true
  render.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(render.domElement)

  const cena = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1.5, 0.1, 400)

  cena.add(new THREE.HemisphereLight(0xcfe0f5, 0x4a4136, 1.15))
  const sol = new THREE.DirectionalLight(0xfff1d6, 2.6)
  sol.position.set(-7, 11, 5)
  sol.castShadow = true
  sol.shadow.mapSize.set(1024, 1024)
  sol.shadow.bias = -0.0006
  sol.shadow.normalBias = 0.03
  cena.add(sol, sol.target)
  // preenchimento frio do lado oposto, sem sombra, para a face escura abrir
  const frio = new THREE.DirectionalLight(0xc9dcff, 0.55)
  frio.position.set(8, 4, -6)
  cena.add(frio)

  const COR = {
    bloco: [0x9fa3ab, 0x8e929b, 0xaeb2ba, 0x95999f],
    areia: 0x6d665c,
    terra: 0x5e5347,
    grama: 0x5a6b43,
    concreto: 0xc3c7ce,
    junta: 0x9aa0a8,
    guia: 0xd7dade,
    guiaFace: 0xb9bdc4,
    sarjeta: 0xcfd3d9,
    asfalto: 0x3a3d45,
    faixa: 0xd8c45a,
  }
  const mat = (c: number, r = 0.92) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0 })

  const grupo = new THREE.Group()
  cena.add(grupo)
  const descartar: any[] = []

  const caixaMesh = (w: number, h: number, d: number, c: number) => {
    const g = new THREE.BoxGeometry(w, h, d)
    const m = mat(c)
    descartar.push(g, m)
    const malha = new THREE.Mesh(g, m)
    malha.castShadow = true
    malha.receiveShadow = true
    return malha
  }

  // ── monta a cena conforme o serviço ────────────────────────────────────
  const limpar = () => {
    grupo.clear()
    for (const o of descartar.splice(0)) o.dispose?.()
  }

  // chão que se estende além da obra e recebe a sombra
  const chaoGeo = new THREE.PlaneGeometry(1, 1)
  const chaoMat = mat(0x24262c, 1)
  const chao = new THREE.Mesh(chaoGeo, chaoMat)
  chao.rotation.x = -Math.PI / 2
  chao.receiveShadow = true
  cena.add(chao)

  let raio = 10, altura = 0.5, mira = 0
  montar = () => {
    limpar()
    const L = Math.max(1, props.largura)       // profundidade (eixo Z)
    const C = Math.max(1, props.comprimento)   // frente (eixo X)

    if (props.servico === 'bloquete') {
      // chão de areia sob o pátio
      const base = caixaMesh(C + 1.2, 0.3, L + 1.2, COR.areia)
      base.position.y = -0.16
      grupo.add(base)

      // peças: quantas cabem na área, com teto de desenho
      let fator = 1
      const estim = (C * L) / (PECA.c * PECA.l)
      if (estim > TETO) fator = Math.sqrt(estim / TETO)
      const pc = PECA.c * fator, pl = PECA.l * fator
      const folga = 0.92

      const pecas: { x: number, z: number, rot: number }[] = []
      if (props.padrao === 'fileira') {
        for (let j = 0; j * pl < L; j++) {
          const desloca = j % 2 ? pc / 2 : 0
          for (let x = -pc; x < C + pc; x += pc) pecas.push({ x: x + desloca, z: j * pl, rot: 0 })
        }
      } else if (props.padrao === 'trama') {
        for (let j = 0; j * pc < L + pc; j++) {
          for (let i = 0; i * pc < C + pc; i++) {
            const x = i * pc, z = j * pc
            if ((i + j) % 2 === 0) {
              pecas.push({ x, z, rot: 0 }); pecas.push({ x, z: z + pl, rot: 0 })
            } else {
              pecas.push({ x, z, rot: Math.PI / 2 }); pecas.push({ x: x + pl, z, rot: Math.PI / 2 })
            }
          }
        }
      } else {
        const passo = pc * Math.SQRT1_2
        for (let j = -1; j * passo < L + passo; j++) {
          const z = j * passo
          const sentido = j % 2 === 0 ? -Math.PI / 4 : Math.PI / 4
          const desloca = j % 2 === 0 ? 0 : passo / 2
          for (let x = -pc; x < C + pc; x += passo) pecas.push({ x: x + desloca, z, rot: sentido })
        }
      }

      const geo = new THREE.BoxGeometry(pc * folga, PECA.e, pl * folga)
      const mInst = mat(0xffffff, 0.9)
      descartar.push(geo, mInst)
      const inst = new THREE.InstancedMesh(geo, mInst, pecas.length)
      const d = new THREE.Object3D()
      const cor = new THREE.Color()
      pecas.forEach((p, i) => {
        d.position.set(p.x - C / 2, PECA.e / 2, p.z - L / 2)
        d.rotation.y = p.rot
        d.updateMatrix()
        inst.setMatrixAt(i, d.matrix)
        inst.setColorAt(i, cor.setHex(COR.bloco[i % COR.bloco.length]))
      })
      inst.instanceMatrix.needsUpdate = true
      inst.receiveShadow = true
      grupo.add(inst)

      // guia contornando o pátio
      for (const [w, dd, x, z] of [
        [C + 2 * GUIA.l, GUIA.l, 0, -L / 2 - GUIA.l / 2],
        [C + 2 * GUIA.l, GUIA.l, 0, L / 2 + GUIA.l / 2],
        [GUIA.l, L, -C / 2 - GUIA.l / 2, 0],
        [GUIA.l, L, C / 2 + GUIA.l / 2, 0],
      ] as number[][]) {
        const g = caixaMesh(w, GUIA.h, dd, COR.guia)
        g.position.set(x, GUIA.h / 2 - 0.06, z)
        grupo.add(g)
      }
      raio = Math.max(C, L) * 1.25 + 3
      altura = 0.5; mira = -0.05
    }

    else if (props.servico === 'calcada') {
      // o passeio fica no alto da guia e a rua 30 cm abaixo: é o degrau
      // que faz a calçada ser reconhecível
      const H = GUIA.h
      const ruaD = Math.max(3.5, L * 0.6)
      const terrD = Math.max(1.5, L * 0.35)

      // terreno do lote, atrás da calçada
      const terra = caixaMesh(C + 1.5, 0.5, terrD, COR.grama)
      terra.position.set(0, 0.02, -L / 2 - terrD / 2)
      grupo.add(terra)

      // base do passeio
      const sub = caixaMesh(C, H - 0.1, L, COR.terra)
      sub.position.set(0, -H + (H - 0.1) / 2, 0)
      grupo.add(sub)

      // placas de concreto de 1 m, com junta entre elas
      const n = Math.max(1, Math.round(C))
      const larg = C / n
      for (let i = 0; i < n; i++) {
        const p = caixaMesh(larg - 0.04, 0.1, L - 0.04, COR.concreto)
        p.position.set(-C / 2 + larg * (i + 0.5), -0.05, 0)
        grupo.add(p)
      }

      // guia na divisa com a rua
      const guia = caixaMesh(C, H, GUIA.l, COR.guia)
      guia.position.set(0, -H / 2, L / 2 + GUIA.l / 2)
      grupo.add(guia)

      // sarjeta e asfalto, no nível da rua
      const sarj = caixaMesh(C, 0.06, 0.45, COR.sarjeta)
      sarj.position.set(0, -H + 0.03, L / 2 + GUIA.l + 0.225)
      grupo.add(sarj)
      const rua = caixaMesh(C + 1.5, 0.12, ruaD, COR.asfalto)
      rua.position.set(0, -H, L / 2 + GUIA.l + 0.45 + ruaD / 2)
      grupo.add(rua)
      const faixa = caixaMesh(C * 0.45, 0.02, 0.1, COR.faixa)
      faixa.position.set(0, -H + 0.07, L / 2 + GUIA.l + 0.45 + ruaD * 0.75)
      grupo.add(faixa)

      raio = Math.max(C, L + ruaD + terrD) * 0.78 + 2.5
      altura = 0.42; mira = -0.12
    }

    else {
      // vista de detalhe: alguns metros de guia vistos de perto
      const H = GUIA.h
      const Cv = Math.min(C, 5)
      const passeioD = 1.8
      const ruaD = 3

      // passeio no alto da guia
      const base = caixaMesh(Cv, H - 0.1, passeioD, COR.terra)
      base.position.set(0, -H + (H - 0.1) / 2, -passeioD / 2 - GUIA.l / 2)
      grupo.add(base)
      const passeio = caixaMesh(Cv, 0.1, passeioD, COR.concreto)
      passeio.position.set(0, -0.05, -passeioD / 2 - GUIA.l / 2)
      grupo.add(passeio)

      // guia em peças de 1 m: fica claro que é vendido por metro
      const n = Math.max(1, Math.round(Cv / GUIA.c))
      const cada = Cv / n
      for (let i = 0; i < n; i++) {
        const g = caixaMesh(cada - 0.025, H, GUIA.l, COR.guia)
        g.position.set(-Cv / 2 + cada * (i + 0.5), -H / 2, 0)
        grupo.add(g)
        const f = caixaMesh(cada - 0.025, H - 0.03, 0.014, COR.guiaFace)
        f.position.set(-Cv / 2 + cada * (i + 0.5), -H / 2 - 0.015, GUIA.l / 2 + 0.008)
        grupo.add(f)
      }

      // sarjeta encostada na guia e asfalto
      const sarj = caixaMesh(Cv, 0.06, 0.45, COR.sarjeta)
      sarj.position.set(0, -H + 0.03, GUIA.l / 2 + 0.225)
      grupo.add(sarj)
      const rua = caixaMesh(Cv + 1.2, 0.12, ruaD, COR.asfalto)
      rua.position.set(0, -H, GUIA.l / 2 + 0.45 + ruaD / 2)
      grupo.add(rua)
      raio = Math.max(Cv, passeioD + ruaD) * 0.78 + 1.8
      altura = 0.44; mira = -0.16
    }
  }

  // ── câmera, giro e laço ────────────────────────────────────────────────
  let angulo = -0.7, alvoAngulo = -0.7
  let arrastando = false, ultimoX = 0

  const enquadrar = () => {
    const d = raio * 0.75
    const c = sol.shadow.camera
    c.left = -d; c.right = d; c.top = d; c.bottom = -d
    c.near = 0.5; c.far = raio * 4
    c.updateProjectionMatrix()
    // pouco maior que a obra, só para a sombra ter onde cair
    chao.scale.set(raio * 1.9, raio * 1.9, 1)
    chao.position.y = -GUIA.h - 0.13
  }

  const posicionar = () => {
    camera.position.set(Math.sin(angulo) * raio, raio * altura, Math.cos(angulo) * raio)
    camera.lookAt(0, mira, 0)
  }

  const medir = () => {
    const w = el.clientWidth || 1, h = el.clientHeight || 1
    render.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  el.addEventListener('pointerdown', (e) => {
    arrastando = true; ultimoX = e.clientX
    el.setPointerCapture(e.pointerId)
  })
  el.addEventListener('pointermove', (e) => {
    if (!arrastando) return
    alvoAngulo += (e.clientX - ultimoX) * 0.009
    ultimoX = e.clientX
  })
  const soltar = () => { arrastando = false }
  el.addEventListener('pointerup', soltar)
  el.addEventListener('pointercancel', soltar)

  montar()
  enquadrar()
  medir()
  // uma pintura imediata: o laço só roda com o quadro visível
  redesenhar = () => { enquadrar(); posicionar(); render.render(cena, camera) }
  redesenhar()

  let quadro = 0, visivel = false
  const desenhar = () => {
    if (!arrastando && !reduzido) alvoAngulo += 0.0016
    angulo += (alvoAngulo - angulo) * 0.1
    posicionar()
    render.render(cena, camera)
    quadro = visivel ? requestAnimationFrame(desenhar) : 0
  }

  const ro = new ResizeObserver(() => { medir(); render.render(cena, camera) })
  ro.observe(el)
  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting
    if (visivel && !quadro) quadro = requestAnimationFrame(desenhar)
  })
  io.observe(el)
  quadro = requestAnimationFrame(desenhar)

  destruir = () => {
    io.disconnect(); ro.disconnect(); cancelAnimationFrame(quadro)
    limpar(); render.dispose(); render.domElement.remove()
  }
}

// refaz a cena quando a medida ou o padrão mudam
watch(() => [props.servico, props.padrao, props.largura, props.comprimento], () => {
  if (!carregado.value) return
  montar()
  redesenhar()
})

onMounted(() => {
  const el = caixa.value
  if (!el) return
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); iniciar() }
  }, { rootMargin: '200px' })
  io.observe(el)
})
onBeforeUnmount(() => destruir())
</script>

<template>
  <div ref="caixa" class="obra3d">
    <span class="obra3d-dica">Arraste para girar</span>
  </div>
</template>

<style scoped>
.obra3d{
  position:relative; width:100%; aspect-ratio:3 / 2; border-radius:12px;
  overflow:hidden; cursor:grab; touch-action:pan-y;
  background:radial-gradient(70% 70% at 50% 35%, #2E323A 0%, #15171C 100%);
}
.obra3d:active{ cursor:grabbing; }
.obra3d :deep(canvas){ display:block; width:100%; height:100%; }
.obra3d-dica{
  position:absolute; left:50%; bottom:10px; translate:-50% 0; z-index:2;
  padding:6px 13px; border-radius:999px; pointer-events:none;
  background:rgba(13,14,17,.6); backdrop-filter:blur(4px);
  font-size:12px; font-weight:600; color:var(--areia);
}
</style>
