package br.com.numerocerto

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

private val Ink = Color(0xFF17152B)
private val Purple = Color(0xFF6C4DFF)
private val Violet = Color(0xFF9D7BFF)
private val Mint = Color(0xFF54E1C1)
private val Soft = Color(0xFFF5F3FF)
private val Muted = Color(0xFF6F6B85)
private const val PREFS = "numerocerto_local"
private const val DRAFTS_KEY = "drafts_json"

data class RaffleDraft(
    val id: Long,
    val name: String,
    val prize: String,
    val organizerType: String,
    val createdAt: Long
)

private fun loadDrafts(context: Context): List<RaffleDraft> {
    return try {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(DRAFTS_KEY, "[]") ?: "[]"
        val array = JSONArray(raw)
        (0 until array.length()).map { i ->
            val item = array.getJSONObject(i)
            RaffleDraft(
                id = item.getLong("id"),
                name = item.getString("name"),
                prize = item.getString("prize"),
                organizerType = item.getString("organizerType"),
                createdAt = item.getLong("createdAt")
            )
        }.sortedByDescending { it.createdAt }
    } catch (_: Exception) {
        emptyList()
    }
}

private fun persistDrafts(context: Context, drafts: List<RaffleDraft>) {
    val array = JSONArray()
    drafts.forEach { draft ->
        array.put(JSONObject().apply {
            put("id", draft.id)
            put("name", draft.name)
            put("prize", draft.prize)
            put("organizerType", draft.organizerType)
            put("createdAt", draft.createdAt)
        })
    }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .edit().putString(DRAFTS_KEY, array.toString()).apply()
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { NumeroCertoApp() }
    }
}

private enum class Screen { HOME, CREATE, NUMBERS, TRANSPARENCY, DRAFTS, FEES, RULES, ORGANIZER }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NumeroCertoApp() {
    val context = LocalContext.current
    var screen by remember { mutableStateOf(Screen.HOME) }
    var raffleName by remember { mutableStateOf("") }
    var prizeDescription by remember { mutableStateOf("") }
    var organizerType by remember { mutableStateOf("Pessoa física — demonstração") }
    var selectedNumbers by remember { mutableStateOf(setOf<Int>()) }
    var savedDraft by remember { mutableStateOf(false) }
    var drafts by remember { mutableStateOf(loadDrafts(context)) }
    var statusMessage by remember { mutableStateOf("") }
    var organizerName by remember { mutableStateOf("") }
    var organizerDocument by remember { mutableStateOf("") }
    var organizerAddress by remember { mutableStateOf("") }
    var organizerEmail by remember { mutableStateOf("") }
    var organizerPhone by remember { mutableStateOf("") }
    var organizerKind by remember { mutableStateOf("Pessoa física") }
    var organizerTermsAccepted by remember { mutableStateOf(false) }
    var organizerStatus by remember { mutableStateOf("Não verificado") }
    var organizerMessage by remember { mutableStateOf("") }
    var isDarkTheme by remember {
        mutableStateOf(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean("dark_theme", false))
    }

    val appBackground = if (isDarkTheme) Color(0xFF100E20) else Soft
    val appSurface = if (isDarkTheme) Color(0xFF211D38) else Color.White
    val appText = if (isDarkTheme) Color(0xFFF7F4FF) else Ink
    val appMuted = if (isDarkTheme) Color(0xFFC4BED8) else Muted

    MaterialTheme(
        colorScheme = if (isDarkTheme) darkColorScheme(
            primary = Violet, secondary = Mint, background = appBackground,
            surface = appSurface, onPrimary = Color(0xFF17152B),
            onBackground = appText, onSurface = appText, onSurfaceVariant = appMuted
        ) else lightColorScheme(
            primary = Purple, secondary = Mint, background = Soft,
            surface = Color.White, onPrimary = Color.White,
            onBackground = Ink, onSurface = Ink, onSurfaceVariant = Muted
        )
    ) {
        Scaffold(
            containerColor = appBackground,
            topBar = {
                TopAppBar(
                    title = { Text("NumeroCerto", fontWeight = FontWeight.Bold) },
                    actions = {
                        TextButton(onClick = {
                            isDarkTheme = false
                            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("dark_theme", false).apply()
                        }) { Text("Claro") }
                        TextButton(onClick = {
                            isDarkTheme = true
                            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("dark_theme", true).apply()
                        }) { Text("Escuro") }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = appBackground,
                        titleContentColor = appText,
                        actionIconContentColor = appText
                    )
                )
            },
            bottomBar = {
                Column {
                NavigationBar(containerColor = appSurface) {
                    NavigationBarItem(screen == Screen.HOME, { screen = Screen.HOME }, { Icon(Icons.Default.ConfirmationNumber, null) }, label = { Text("Início") })
                    NavigationBarItem(screen == Screen.CREATE, { screen = Screen.CREATE }, { Icon(Icons.Default.Add, null) }, label = { Text("Criar") })
                    NavigationBarItem(screen == Screen.DRAFTS, { screen = Screen.DRAFTS }, { Icon(Icons.Default.Visibility, null) }, label = { Text("Rascunhos") })
                    NavigationBarItem(screen == Screen.TRANSPARENCY, { screen = Screen.TRANSPARENCY }, { Icon(Icons.Default.Shield, null) }, label = { Text("Info") })
                }
                Text(
                    "Desenvolvedor: Gabriela Teixeira",
                    modifier = Modifier.fillMaxWidth().background(appBackground).padding(horizontal = 8.dp, vertical = 5.dp),
                    color = if (isDarkTheme) Color.White else Color.Black,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
                }
            }
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (screen) {
                    Screen.HOME -> HomeScreen(
                        draftCount = drafts.size,
                        onCreate = { screen = Screen.CREATE },
                        onNumbers = { screen = Screen.NUMBERS },
                        onTransparency = { screen = Screen.TRANSPARENCY },
                        onDrafts = { screen = Screen.DRAFTS },
                        onFees = { screen = Screen.FEES },
                        onRules = { screen = Screen.RULES },
                        onOrganizer = { screen = Screen.ORGANIZER },
                        organizerStatus = organizerStatus
                    )
                    Screen.CREATE -> CreateScreen(
                        raffleName = raffleName,
                        onNameChange = { raffleName = it; savedDraft = false; statusMessage = "" },
                        prizeDescription = prizeDescription,
                        onPrizeChange = { prizeDescription = it; savedDraft = false; statusMessage = "" },
                        organizerType = organizerType,
                        onOrganizerTypeChange = { organizerType = it },
                        savedDraft = savedDraft,
                        statusMessage = statusMessage,
                        onSaveDraft = {
                            val draft = RaffleDraft(
                                id = System.currentTimeMillis(),
                                name = raffleName.trim(),
                                prize = prizeDescription.trim(),
                                organizerType = organizerType,
                                createdAt = System.currentTimeMillis()
                            )
                            drafts = listOf(draft) + drafts
                            persistDrafts(context, drafts)
                            savedDraft = true
                            statusMessage = "Rascunho salvo neste aparelho."
                        }
                    )
                    Screen.NUMBERS -> NumberGridScreen(
                        selected = selectedNumbers,
                        onToggle = { n -> selectedNumbers = if (n in selectedNumbers) selectedNumbers - n else selectedNumbers + n },
                        onBack = { screen = Screen.HOME }
                    )
                    Screen.TRANSPARENCY -> TransparencyScreen()
                    Screen.FEES -> FeeSimulatorScreen()
                    Screen.RULES -> RulesScreen()
                    Screen.ORGANIZER -> OrganizerScreen(
                        organizerKind = organizerKind,
                        onKindChange = { organizerKind = it; organizerMessage = "" },
                        name = organizerName,
                        onNameChange = { organizerName = it; organizerMessage = "" },
                        document = organizerDocument,
                        onDocumentChange = { organizerDocument = it.filter(Char::isLetterOrDigit).take(14); organizerMessage = "" },
                        address = organizerAddress,
                        onAddressChange = { organizerAddress = it; organizerMessage = "" },
                        email = organizerEmail,
                        onEmailChange = { organizerEmail = it; organizerMessage = "" },
                        phone = organizerPhone,
                        onPhoneChange = { organizerPhone = it; organizerMessage = "" },
                        termsAccepted = organizerTermsAccepted,
                        onTermsChange = { organizerTermsAccepted = it; organizerMessage = "" },
                        status = organizerStatus,
                        message = organizerMessage,
                        onValidate = {
                            val expectedLength = if (organizerKind == "Pessoa física") 11 else 14
                            val emailValid = organizerEmail.isBlank() || android.util.Patterns.EMAIL_ADDRESS.matcher(organizerEmail).matches()
                            when {
                                organizerName.isBlank() -> organizerMessage = "Informe o nome completo ou a razão social."
                                organizerDocument.length != expectedLength -> organizerMessage = if (organizerKind == "Pessoa física") "Informe um CPF com 11 dígitos, sem pontuação." else "Informe um CNPJ com 14 dígitos, sem pontuação."
                                organizerAddress.isBlank() -> organizerMessage = "Informe o endereço para a análise demonstrativa."
                                organizerPhone.isBlank() -> organizerMessage = "Informe um telefone de contato."
                                !emailValid -> organizerMessage = "Confira o e-mail ou deixe o campo em branco."
                                !organizerTermsAccepted -> organizerMessage = "Leia e aceite o aviso de privacidade para continuar."
                                else -> {
                                    organizerStatus = "Cadastro preenchido — identidade NÃO verificada"
                                    organizerMessage = "Campos conferidos nesta sessão. Nenhum dado foi enviado ou salvo. A identidade continua não verificada."
                                }
                            }
                        },
                        onClear = {
                            organizerName = ""; organizerDocument = ""; organizerAddress = ""
                            organizerEmail = ""; organizerPhone = ""; organizerTermsAccepted = false
                            organizerStatus = "Não verificado"
                            organizerMessage = "Campos limpos desta sessão."
                        }
                    )
                    Screen.DRAFTS -> DraftsScreen(
                        drafts = drafts,
                        onDelete = { draft ->
                            drafts = drafts.filterNot { it.id == draft.id }
                            persistDrafts(context, drafts)
                        },
                        onBack = { screen = Screen.HOME }
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(
    draftCount: Int,
    onCreate: () -> Unit,
    onNumbers: () -> Unit,
    onTransparency: () -> Unit,
    onDrafts: () -> Unit,
    onFees: () -> Unit,
    onRules: () -> Unit,
    onOrganizer: () -> Unit,
    organizerStatus: String
) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("NUMEROCERTO", fontSize = 12.sp, color = Purple, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                Text("Sorteios com\nmais transparência.", fontSize = 30.sp, lineHeight = 35.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onSurface)
            }
            PremiumOrb()
        }
        Box(Modifier.fillMaxWidth().background(Brush.linearGradient(listOf(Ink, Color(0xFF39276F))), RoundedCornerShape(28.dp)).padding(22.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Surface(color = Color.White.copy(alpha = .12f), shape = RoundedCornerShape(50)) {
                    Text("VERSÃO DEMONSTRAÇÃO", Modifier.padding(horizontal = 12.dp, vertical = 7.dp), color = Mint, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                Text("Sua próxima experiência começa aqui.", color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Bold)
                Text("Crie rascunhos e explore os números. Vendas, pagamentos e publicação pública estão desativados.", color = Color.White.copy(alpha = .8f), fontSize = 14.sp)
                Button(onClick = onCreate, Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Mint, contentColor = Ink)) {
                    Icon(Icons.Default.Add, null); Spacer(Modifier.width(8.dp)); Text("Criar rascunho")
                }
            }
        }
        Text("Seu espaço", fontSize = 19.sp, fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            FeatureCard("001–1000", "Grade de números", Modifier.weight(1f), onNumbers)
            FeatureCard("$draftCount rascunho(s)", "Salvos no aparelho", Modifier.weight(1f), onDrafts)
        }
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(20.dp)) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Icon(Icons.Default.Info, null, tint = Purple)
                Column {
                    Text("Transparência em primeiro lugar", fontWeight = FontWeight.Bold)
                    Text("Nenhuma parceria com a Loteria Mineira foi confirmada. Veja os detalhes na área de transparência.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    TextButton(onClick = onTransparency) { Text("Ver informações") }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            FeatureCard("Simular taxa", "Estimativa demonstrativa", Modifier.weight(1f), onFees)
            FeatureCard("Regras claras", "Organizador e participante", Modifier.weight(1f), onRules)
        }
        FeatureCard("Cadastro do organizador", organizerStatus, Modifier.fillMaxWidth(), onOrganizer)
        Text("Projeto independente • versão 0.4.0-demo", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun PremiumOrb() {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (pressed) .94f else 1f, label = "orbScale")
    Box(Modifier.size(94.dp).scale(scale).background(Brush.linearGradient(listOf(Violet, Purple, Color(0xFF342070))), RoundedCornerShape(30.dp)).clickable { pressed = !pressed }, contentAlignment = Alignment.Center) {
        Text("✦", fontSize = 48.sp, color = Color.White)
    }
}

@Composable
private fun FeatureCard(title: String, subtitle: String, modifier: Modifier, onClick: () -> Unit) {
    Card(modifier.clickable(onClick = onClick), shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(title, fontWeight = FontWeight.ExtraBold, color = Purple, fontSize = 17.sp)
            Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateScreen(
    raffleName: String,
    onNameChange: (String) -> Unit,
    prizeDescription: String,
    onPrizeChange: (String) -> Unit,
    organizerType: String,
    onOrganizerTypeChange: (String) -> Unit,
    savedDraft: Boolean,
    statusMessage: String,
    onSaveDraft: () -> Unit
) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Criar rascunho", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
        Text("Os dados ficam localmente neste aparelho. Nada será publicado ou vendido.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        OutlinedTextField(raffleName, onNameChange, label = { Text("Nome do sorteio") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        OutlinedTextField(prizeDescription, onPrizeChange, label = { Text("Descrição do prêmio") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
        Text("Tipo de organizador (demonstração)", fontWeight = FontWeight.Bold)
        var expanded by remember { mutableStateOf(false) }
        ExposedDropdownMenuBox(expanded, { expanded = !expanded }) {
            OutlinedTextField(organizerType, {}, readOnly = true, label = { Text("Tipo de cadastro") }, trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) }, modifier = Modifier.menuAnchor().fillMaxWidth())
            ExposedDropdownMenu(expanded, { expanded = false }) {
                listOf("Pessoa física — demonstração", "Pessoa jurídica — demonstração").forEach {
                    DropdownMenuItem(text = { Text(it) }, onClick = { onOrganizerTypeChange(it); expanded = false })
                }
            }
        }
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFEDE8FF))) {
            Text("Esta versão não coleta CPF/CNPJ, não verifica identidade e não substitui autorizações legais.", Modifier.padding(14.dp), color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
        }
        Button(onClick = onSaveDraft, enabled = raffleName.isNotBlank() && prizeDescription.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Salvar rascunho") }
        AnimatedVisibility(savedDraft) { Text(statusMessage, color = Color(0xFF13795B), fontWeight = FontWeight.SemiBold) }
        Text("Demonstração • sem pagamentos • sem publicação", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
    }
}

@Composable
private fun DraftsScreen(drafts: List<RaffleDraft>, onDelete: (RaffleDraft) -> Unit, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("← Início") }
            Text("Meus rascunhos", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
        }
        Spacer(Modifier.height(12.dp))
        if (drafts.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Nenhum rascunho salvo ainda.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(drafts, key = { it.id }) { draft ->
                    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(18.dp)) {
                        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.Top) {
                            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                Text(draft.name, fontWeight = FontWeight.Bold)
                                Text(draft.prize, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                                Text("Rascunho local • ${draft.organizerType}", color = Purple, fontSize = 11.sp)
                            }
                            IconButton(onClick = { onDelete(draft) }) { Icon(Icons.Default.DeleteOutline, "Excluir rascunho", tint = Color(0xFFB42318)) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun NumberGridScreen(selected: Set<Int>, onToggle: (Int) -> Unit, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(horizontal = 12.dp, vertical = 10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("← Voltar") }
            Column(Modifier.weight(1f)) {
                Text("Escolha números", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold)
                Text("${selected.size} selecionado(s) • demonstração", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
        }
        Text("Toque para selecionar ou desmarcar. Não reserva nem compra números.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 8.dp))
        LazyVerticalGrid(columns = GridCells.Fixed(4), modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(bottom = 20.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            gridItems((1..1000).toList(), key = { it }) { number ->
                val isSelected = number in selected
                Surface(
                    Modifier.aspectRatio(1.2f).clickable { onToggle(number) },
                    shape = RoundedCornerShape(12.dp),
                    color = if (isSelected) Purple else Color.White,
                    tonalElevation = if (isSelected) 4.dp else 0.dp,
                    border = if (isSelected) null else BorderStroke(1.dp, Color(0xFFE5E0F5))
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(number.toString().padStart(3, '0'), color = if (isSelected) Color.White else Ink, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun TransparencyScreen() {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Transparência", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
        Text("Informações sobre o protótipo e sua situação regulatória.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        TransparencyItem("Desenvolvedor", "Projeto independente em fase de protótipo. Nome empresarial e dados oficiais serão adicionados quando definidos.")
        TransparencyItem("Loteria Mineira", "Nenhuma parceria ou autorização foi confirmada nesta versão.")
        TransparencyItem("Autorizações", "Aguardando orientação formal. Nenhum documento autorizativo está publicado.")
        TransparencyItem("Resultados", "Não há integração com fonte oficial. Nenhum resultado real é consultado ou declarado.")
        TransparencyItem("Termos e privacidade", "Termos, política de privacidade e canal de contato deverão ser publicados antes de qualquer lançamento.")
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Espaço para autorização futura", fontWeight = FontWeight.Bold)
                Text("Adicionar apenas documento publicável e verificável, órgão emissor, número/data, escopo e validade. Não divulgar dados pessoais ou conteúdo confidencial.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            }
        }
        Text("Este texto não substitui orientação jurídica.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
    }
}

@Composable
private fun TransparencyItem(title: String, body: String) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(18.dp)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(title, fontWeight = FontWeight.Bold, color = Purple)
            Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
        }
    }
}


@Composable
private fun FeeSimulatorScreen() {
    var soldCount by remember { mutableStateOf("0") }
    var unitPrice by remember { mutableStateOf("10") }
    var refunds by remember { mutableStateOf("0") }

    val sold = soldCount.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val price = unitPrice.replace(",", ".").toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0
    val refunded = refunds.replace(",", ".").toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0
    val gross = sold * price
    val net = (gross - refunded).coerceAtLeast(0.0)
    val demoFee = when {
        net < 200.0 -> 0.0
        net < 500.0 -> 10.0
        net < 1000.0 -> 20.0
        else -> 20.0 + ((net - 1000.0) * 0.01).coerceAtMost(80.0)
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Simulador de taxa", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
        Text("Faça uma estimativa antes de qualquer cobrança. Os valores abaixo são fictícios e não representam uma tarifa aprovada.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 16.sp)
        OutlinedTextField(
            value = soldCount,
            onValueChange = { soldCount = it.filter(Char::isDigit).take(5) },
            label = { Text("Números efetivamente vendidos") },
            supportingText = { Text("Não conte números apenas selecionados ou reservados.") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = unitPrice,
            onValueChange = { unitPrice = it.filter { c -> c.isDigit() || c == ',' || c == '.' }.take(10) },
            label = { Text("Preço de cada número (R$)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        OutlinedTextField(
            value = refunds,
            onValueChange = { refunds = it.filter { c -> c.isDigit() || c == ',' || c == '.' }.take(10) },
            label = { Text("Cancelamentos/reembolsos (R$)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(22.dp)) {
            Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Resumo estimado", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                FeeSummaryRow("Vendas brutas", "R$ ${"%.2f".format(java.util.Locale("pt", "BR"), gross)}")
                FeeSummaryRow("Reembolsos informados", "R$ ${"%.2f".format(java.util.Locale("pt", "BR"), refunded)}")
                HorizontalDivider()
                FeeSummaryRow("Receita estimada após reembolsos", "R$ ${"%.2f".format(java.util.Locale("pt", "BR"), net)}")
                FeeSummaryRow("Taxa ilustrativa", "R$ ${"%.2f".format(java.util.Locale("pt", "BR"), demoFee)}")
            }
        }
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFEDE8FF)), shape = RoundedCornerShape(18.dp)) {
            Text(
                "IMPORTANTE: esta é uma simulação local, não usa IA nem confirma pagamentos. A taxa real, o método de cálculo e a cobrança no fim só poderão ser ativados após análise jurídica, definição pública da tabela e implementação segura de pagamentos. Pagar a taxa não autoriza uma rifa.",
                Modifier.padding(16.dp), color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, lineHeight = 23.sp
            )
        }
    }
}

@Composable
private fun FeeSummaryRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, modifier = Modifier.weight(1f), fontSize = 15.sp)
        Spacer(Modifier.width(12.dp))
        Text(value, fontWeight = FontWeight.Bold, fontSize = 16.sp)
    }
}

@Composable
private fun RulesScreen() {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Regras claras", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        Text("Texto demonstrativo com letras legíveis. As regras finais precisam de revisão jurídica antes do lançamento.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 16.sp)
        RuleCard("PARA QUEM ORGANIZA", listOf(
            "Informe a verdade sobre o prêmio, seu estado e as condições.",
            "Envie evidências atuais quando solicitado. A análise por IA pode falhar e não garante autenticidade.",
            "Não altere prêmio, preço, regras ou datas sem seguir o procedimento permitido.",
            "Registre a entrega e o rastreamento do prêmio quando aplicável.",
            "Não publique nem realize sorteio sem cumprir as exigências legais e autorizações aplicáveis."
        ))
        RuleCard("PARA QUEM PARTICIPA", listOf(
            "Confira o prêmio, as condições, o método do sorteio e as datas antes de participar.",
            "Guarde comprovantes e mensagens relacionadas à participação.",
            "Ao receber o prêmio, confira se corresponde ao anunciado e registre problemas.",
            "Você pode apresentar uma reclamação mesmo tendo aceitado as regras. O aceite não elimina direitos previstos em lei."
        ))
        RuleCard("O QUE ACONTECE SE ALGUÉM DESCUMPRIR", listOf(
            "Antes da publicação: a plataforma pode bloquear o avanço até a pendência ser resolvida.",
            "Depois da publicação: a página pode ser ocultada ou suspensa enquanto o caso é analisado.",
            "Se houver reclamação: a plataforma analisa evidências e permite resposta das partes, conforme procedimento publicado.",
            "Se a infração for confirmada: podem ser aplicadas medidas previstas nos termos, incluindo suspensão ou encerramento da conta, respeitando a lei.",
            "Registros relevantes podem ser preservados de forma restrita para auditoria, contestação e obrigações legais; não serão expostos publicamente."
        ))
        RuleCard("PRIVACIDADE E ACEITE", listOf(
            "As regras serão exibidas separadamente para organizadores e participantes, em texto grande, claro e sem letras miúdas.",
            "O aceite registra a versão e a data/hora, mas não prova que a pessoa leu cada linha nem elimina direitos legais.",
            "Não exigiremos IMEI como condição padrão de participação. Só poderá haver pedido excepcional e proporcional de informação técnica se houver justificativa legítima, proteção adequada e aviso claro.",
            "A identidade verificada não significa que uma rifa ou sorteio está legalmente autorizado."
        ))
        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF0D8)), shape = RoundedCornerShape(18.dp)) {
            Text(
                "STATUS ATUAL: o app é um protótipo. Venda de números, pagamentos, publicação pública e sorteio final permanecem desativados. A SPA/MF informa que rifas com venda de bilhetes numerados não são admitidas em regra; há regimes específicos, como sorteios de entidades beneficentes mediante autorização. Consulte a orientação oficial antes de escolher o modelo.",
                Modifier.padding(16.dp), color = MaterialTheme.colorScheme.onSurface, fontSize = 16.sp, lineHeight = 23.sp
            )
        }
    }
}

@Composable
private fun RuleCard(title: String, rules: List<String>) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(20.dp)) {
        Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, fontSize = 19.sp, fontWeight = FontWeight.ExtraBold, color = Purple)
            rules.forEachIndexed { index, rule ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.Top) {
                    Text("${index + 1}.", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Purple)
                    Text(rule, modifier = Modifier.weight(1f), fontSize = 16.sp, lineHeight = 23.sp)
                }
            }
        }
    }
}


@Composable
private fun OrganizerScreen(
    organizerKind: String,
    onKindChange: (String) -> Unit,
    name: String,
    onNameChange: (String) -> Unit,
    document: String,
    onDocumentChange: (String) -> Unit,
    address: String,
    onAddressChange: (String) -> Unit,
    email: String,
    onEmailChange: (String) -> Unit,
    phone: String,
    onPhoneChange: (String) -> Unit,
    termsAccepted: Boolean,
    onTermsChange: (Boolean) -> Unit,
    status: String,
    message: String,
    onValidate: () -> Unit,
    onClear: () -> Unit
) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Cadastro do organizador", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
        Text("Os dados serviriam para identificar quem organiza e permitir contato em caso de problemas. Nesta demonstração, nada é enviado ou salvo.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 16.sp, lineHeight = 23.sp)

        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(20.dp)) {
            Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Status do cadastro", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(status, color = Purple, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                Text("Identidade verificada é diferente de autorização legal para realizar um sorteio.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp, lineHeight = 20.sp)
            }
        }

        Text("Tipo de organizador", fontWeight = FontWeight.Bold, fontSize = 17.sp)
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            FilterChip(selected = organizerKind == "Pessoa física", onClick = { onKindChange("Pessoa física") }, label = { Text("Pessoa física") })
            FilterChip(selected = organizerKind == "Pessoa jurídica", onClick = { onKindChange("Pessoa jurídica") }, label = { Text("Empresa / entidade") })
        }
        OutlinedTextField(value = name, onValueChange = onNameChange, label = { Text("Nome completo ou razão social") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        OutlinedTextField(
            value = document, onValueChange = onDocumentChange,
            label = { Text(if (organizerKind == "Pessoa física") "CPF (somente dígitos)" else "CNPJ (somente dígitos)") },
            supportingText = { Text("Demonstração: não é feita validação oficial nem consulta a bases públicas.") },
            modifier = Modifier.fillMaxWidth(), singleLine = true
        )
        OutlinedTextField(value = address, onValueChange = onAddressChange, label = { Text("Endereço para contato/verificação") }, modifier = Modifier.fillMaxWidth(), minLines = 2)
        OutlinedTextField(value = phone, onValueChange = onPhoneChange, label = { Text("Telefone de contato") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        OutlinedTextField(value = email, onValueChange = onEmailChange, label = { Text("E-mail (opcional)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFEDE8FF)), shape = RoundedCornerShape(18.dp)) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Aviso de privacidade", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text("Em uma versão real, o NumeroCerto deverá explicar a finalidade de cada dado, limitar o acesso, proteger o armazenamento, definir retenção e permitir os direitos previstos na LGPD. Não envie documentos ou dados reais nesta demonstração.", fontSize = 15.sp, lineHeight = 22.sp)
            }
        }
        Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Checkbox(checked = termsAccepted, onCheckedChange = onTermsChange)
            Text("Li o aviso de privacidade e entendi que esta tela é apenas uma demonstração. O aceite não significa que minha identidade ou autorização foi verificada.", modifier = Modifier.weight(1f), fontSize = 15.sp, lineHeight = 22.sp)
        }
        Button(onClick = onValidate, modifier = Modifier.fillMaxWidth()) { Text("Conferir campos (demonstração)") }
        OutlinedButton(onClick = onClear, modifier = Modifier.fillMaxWidth()) { Text("Limpar campos desta sessão") }
        if (message.isNotBlank()) {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface), shape = RoundedCornerShape(16.dp)) {
                Text(message, Modifier.padding(16.dp), fontSize = 15.sp, lineHeight = 22.sp, color = MaterialTheme.colorScheme.onSurface)
            }
        }
        Text("Importante: não armazene CPF, endereço ou outros dados sensíveis em SharedPreferences sem uma arquitetura de segurança adequada. Esta tela não transmite, salva nem verifica os dados.", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp, lineHeight = 19.sp)
    }
}
