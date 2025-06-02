// Define as dimensões da tela do jogo
const sizes = {
    width: 426,
    height: 240,
};

// Gerenciador de Quartos
class RoomManager {
    constructor(scene) {
        this.scene = scene;
        this.currentRoom = 1;
        this.maxRooms = 4;
        this.interactiveZones = []; // Armazena todas as zonas interativas
    }

    loadRoom(roomNumber) {
        this.currentRoom = roomNumber;

        // Limpa as zonas interativas anteriores
        this.clearPreviousZones();

        // Atualiza a cena
        const mapKey = `mapa${roomNumber}`;
        this.scene.updateBackground(`bg${roomNumber}`);
        this.scene.loadMapObjects(`mapa${roomNumber}`);
        this.scene.currentMapKey = mapKey;
        this.scene.updateArrowsVisibility();
    }

    clearPreviousZones() {
        this.interactiveZones.forEach(zone => zone.destroy());
        this.interactiveZones = [];
    }

    nextRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom((this.currentRoom % totalRooms) + 1);
    }

    prevRoom() {
        const totalRooms = this.scene.standardRooms.length;
        this.loadRoom(((this.currentRoom - 2 + totalRooms) % totalRooms) + 1);
    }
}

// Cena Principal do Jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.roomManager = null;
        this.bg = null;
        this.tooltip = null;
        this.arrows = {
            left: null,
            right: null
        };
        this.standardRooms = ['mapa1', 'mapa2', 'mapa3', 'mapa4'];
        this.currentMapKey = null;
    }

    preload() {

        //Carrega Puzzle Clara
        this.load.image('fundopuzzle1', '/assets/images/fundopuzzle1.png');
        this.load.image('testeP', '/assets/images/Logo.png');

        // Carrega todos os fundos
        this.load.image('bg1', '/assets/images/parede1.png');
        this.load.image('bg2', '/assets/images/parede2.png');
        this.load.image('bg3', '/assets/images/parede3.png');
        this.load.image('bg4', '/assets/images/parede4.png');
        this.load.image('caixaclara', '/assets/images/CaixaClara.png');

        // Carrega os mapas
        this.load.json('mapa1', './maps/mapa1.json');
        this.load.json('mapa2', './maps/mapa2.json');
        this.load.json('mapa3', './maps/mapa3.json');
        this.load.json('mapa4', './maps/mapa4.json');
        this.load.json('caixaclara', './maps/caixaclara.json');

        // Carrega ícone de seta
        this.load.image('seta', '/assets/ui/seta.png');
    }

    create() {
        // Inicializa o gerenciador de quartos
        this.roomManager = new RoomManager(this);

        // Configura o fundo
        this.bg = this.add.image(0, 0, 'bg1').setOrigin(0, 0);
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;

        // Cria as setas de navegação
        this.createNavigationArrows();

        // Configura o tooltip
        this.tooltip = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#fff',
            padding: { x: 5, y: 2 },
            resolution: 3, // Dobra a resolução do texto
        }).setDepth(100).setVisible(false);
        // Carrega o primeiro quarto (com pequeno delay para garantir inicialização)
        this.time.delayedCall(100, () => {
            this.roomManager.loadRoom(1);
        });

        // Caixa de diálogo inferior
        this.textBoxBackground = this.add.rectangle(0, sizes.height - 60, sizes.width, 60, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setDepth(100)
            .setVisible(false);

        this.textBox = this.add.text(10, sizes.height - 55, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            resolution: 3,
            color: '#ffffff',
            wordWrap: { width: sizes.width - 20 }
        })
            .setDepth(101)
            .setVisible(true);


        // Botões na ESQUERDA
        this.buttonOpen = this.add.text(10, sizes.height - 25, '[Abrir]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#00ff00',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.loadCustomMap('caixaclara', 'caixaclara');
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

        this.buttonClose = this.add.text(90, sizes.height - 25, '[Fechar]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ff0000',
            padding: { x: 6, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            resolution: 2,
        })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.hideTextBox();
            })
            .setDepth(101)
            .setVisible(false);

    }

    loadCustomMap(mapKey, bgKey) {
        // Limpa zonas interativas anteriores
        this.roomManager.clearPreviousZones();

        // Atualiza o fundo, se quiser um fundo específico para o POV
        if (bgKey) {
            this.updateBackground(bgKey);
        }

        // Carrega objetos do mapa customizado
        this.loadMapObjects(mapKey);

        this.currentMapKey = mapKey;

        // Esconde setas (se não quiser navegar no POV)
        this.arrows.left.setVisible(false);
        this.arrows.right.setVisible(false);
    }

    isStandardRoom() { // Verificação se é um quarto padrão para as setas aparecerem 
        return this.standardRooms.includes(this.currentMapKey);
    }

    createNavigationArrows() {
        // Seta esquerda
        this.arrows.left = this.add.image(20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setAngle(180)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.roomManager.prevRoom())
            .setVisible(false);

        // Seta direita
        this.arrows.right = this.add.image(this.scale.width - 20, this.scale.height / 2, 'seta')
            .setOrigin(0.5)
            .setDisplaySize(25, 25)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.roomManager.nextRoom());
    }

    updateArrowsVisibility() {
        this.arrows.left.setVisible(true);
        this.arrows.right.setVisible(true);
    }

    updateBackground(bgKey) {
        this.bg.setTexture(bgKey);
    }

    loadMapObjects(mapKey) {
        // Carrega os objetos do mapa
        const mapData = this.cache.json.get(mapKey);
        const objetos = mapData.layers.filter(layer => layer.type === 'objectgroup');

        objetos.forEach(group => {
            group.objects.forEach(obj => {
                // Cria zona interativa
                const zone = this.add.zone(obj.x, obj.y, obj.width, obj.height)
                    .setOrigin(0)
                    .setInteractive({ useHandCursor: true })
                    .on('pointerover', () => this.showTooltip(obj))
                    .on('pointerout', () => this.tooltip.setVisible(false))
                    .on('pointerdown', () => this.handleObjectClick(obj));

                // Armazena a zona para limpeza posterior
                this.roomManager.interactiveZones.push(zone);

                // Debug visual (opcional)
                // const debugRect = this.add.rectangle(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, obj.height)
                //     .setStrokeStyle(1, 0x00ff00)
                //     .setDepth(99);

                // this.roomManager.interactiveZones.push(debugRect);
            });
        });
    }

    showTooltip(obj) {
        this.tooltip.setText(obj.name);

        let posX = obj.x + 10;
        let posY = obj.y - 20;

        if (posY < 0) posY = obj.y + 20;
        if (posX + this.tooltip.width > this.scale.width) posX = this.scale.width - this.tooltip.width - 10;
        if (posX < 0) posX = 10;

        this.tooltip.setPosition(posX, posY).setVisible(true);
    }

    handleObjectClick(obj) {
        //         if (obj.name === "caixa pequena") {
        //     this.loadCustomMap('caixaclara', 'caixaclara');
        //     this.showTextBox("Você abriu a caixa pequena.");
        // }
        console.log(`Clicou em: ${obj.name}`);

        if (obj.name === "caixa pequena") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Clara por aqui..");
            return;
        }


        // Lógica para ativar o puzzle de senha
        if (obj.name === "cofre_trancado") {
            this.showTextBox("Um cofre trancado. Parece precisar de uma senha de 3 dígitos.");
            this.time.delayedCall(3000, () => {
                this.startPasswordPuzzle(
                    "124", // <--- ALHEREI AQUI PARA UMA SENHA NUMÉRICA
                    () => {
                        // Callback de sucesso: O que acontece quando a senha está correta
                        this.showTextBox("O cofre se abriu! Você encontrou um Pincel.");
                        this.inventoryManager.addItem("pincel");
                    },
                    () => {
                        // Callback de falha (opcional)
                        console.log("Senha incorreta, tente novamente.");
                    }
                );
            });
            return;
        }

        if (obj.name === "caixa grande") {
            this.showTextBoxWithChoices("Nossa.. tantas memórias da Helena por aqui..");
            // ... (Lógica da caixa grande que fizemos anteriormente) ...
            return;
        }

        // --- Lógica para ativar o puzzle ---
        if (obj.name === "quadro_puzzle") { // Supondo que você nomeou um objeto no Tiled como "quadro_puzzle"
            this.startImagePuzzle();
            return; // Impede que outras lógicas de clique sejam executadas
        }
        // --- Fim da lógica para ativar o puzzle ---

        if (obj.name === "voltar") {
            this.loadCustomMap('mapa1', 'bg1'); // Ex: mapa POV + fundo opcional
        }

        if (this.isStandardRoom()) {
            this.arrows.left.setVisible(true);
            this.arrows.right.setVisible(true);
        } else {
            this.arrows.left.setVisible(false);
            this.arrows.right.setVisible(false);
        }

        // Adicione aqui lógica para interação com objetos específicos
    }

    showTextBoxWithChoices(message) {
        this.textBox.setText(message).setVisible(true);
        this.textBoxBackground.setVisible(true);
        this.buttonOpen.setVisible(true);
        this.buttonClose.setVisible(true);
    }

    hideTextBox() {
        this.textBox.setVisible(false);
        this.textBoxBackground.setVisible(false);
        this.buttonOpen.setVisible(false);
        this.buttonClose.setVisible(false);
    }

    // Inicia o puzzle de arrastar e soltar as 4 imagens.
    startImagePuzzle() {
        // Limpa as zonas interativas da sala atual e esconde as setas de navegação
        this.roomManager.clearPreviousZones();
        this.arrows.left.setVisible(false);
        this.arrows.right.setVisible(false);

        // Opcional: Mudar o fundo para o fundo do puzzle
        // this.updateBackground('puzzle_bg'); // Descomente se tiver um fundo específico para o puzzle

        this.showTextBox("Arraste as peças para formar a imagem.");
        this.textBox.setFontSize('10px'); // Aumenta o tamanho da fonte para a mensagem do puzzle
        this.buttonOpen.setVisible(false); // Esconde os botões de Abrir/Fechar
        this.buttonClose.setVisible(false);

        // Posições iniciais para as peças do puzzle
        const startX = sizes.width / 2 - 100;
        const startY = sizes.height / 2 - 50;
        const pieceSize = { width: 50, height: 50 }; // Ajuste o tamanho conforme suas imagens

        const puzzlePieces = [];

        // Cria e configura cada peça do puzzle
        for (let i = 1; i <= 4; i++) {
            const pieceKey = `puzzle_piece_${i}`;
            const piece = this.add.image(
                startX + ((i - 1) * (pieceSize.width + 10)), // Posição X
                startY, // Posição Y
                pieceKey
            )
                .setOrigin(0.5)
                .setDisplaySize(pieceSize.width, pieceSize.height)
                .setInteractive() // Torna a imagem interativa
                .setDepth(100); // Garante que as peças fiquem acima do fundo

            // Habilita arrastar e soltar (drag and drop)
            this.input.setDraggable(piece);

            // Evento quando a peça é arrastada
            piece.on('drag', (pointer, dragX, dragY) => {
                piece.x = dragX;
                piece.y = dragY;
            });

            puzzlePieces.push(piece);
        }

        // Adiciona um botão "Voltar" ou "Sair do Puzzle"
        this.exitPuzzleButton = this.add.text(
            sizes.width - 70, 20, // Posição
            '[Sair]', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffff00',
            padding: { x: 5, y: 2 },
            stroke: '#000000',
            strokeThickness: 2,
            resolution: 2,
        }
        )
            .setInteractive({ useHandCursor: true })
            .setDepth(101)
            .on('pointerdown', () => {
                // Destrói as peças do puzzle
                puzzlePieces.forEach(piece => piece.destroy());
                this.exitPuzzleButton.destroy();
                this.hideTextBox();
                this.textBox.setFontSize('8px'); // Restaura o tamanho da fonte
                // Retorna para a sala atual ou uma sala específica
                this.roomManager.loadRoom(this.roomManager.currentRoom);
            });

        // Você pode adicionar a lógica para verificar se o puzzle foi resolvido aqui
        // Por exemplo, um evento de 'pointerup' nas peças que verifica suas posições.
        // No momento, as peças são apenas arrastáveis.
    }

    /**
     * Inicia o puzzle de inserção de senha de 3 dígitos.
     * @param {string} correctPassword A senha correta para o puzzle (ex: "123").
     * @param {function} onSuccess Callback a ser executado quando a senha for correta.
     * @param {function} onFailure Callback a ser executado quando a senha for incorreta (opcional).
     */
    startPasswordPuzzle(correctPassword, onSuccess, onFailure = () => {}) {
        this.correctPassword = correctPassword;
        this.onPasswordSuccess = onSuccess;
        this.onPasswordFailure = onFailure;
        this.currentInput = ''; // Armazena os dígitos que o jogador está digitando
        const maxDigits = 3; // Senha de 3 dígitos

        // Limpa as zonas interativas da sala atual e esconde as setas de navegação
        this.roomManager.clearPreviousZones();
        this.arrows.left.setVisible(false);
        this.arrows.right.setVisible(false);

        // Esconde a caixa de texto padrão e botões, se visíveis
        this.hideTextBox();

        // Fundo do puzzle (opcional)
        // Se você tiver uma imagem de fundo para o teclado, use aqui
        // this.passwordPuzzleBg = this.add.image(sizes.width / 2, sizes.height / 2, 'keypad_bg')
        //     .setDisplaySize(200, 150) // Ajuste o tamanho
        //     .setOrigin(0.5)
        //     .setDepth(100);

        // Caixa para exibir a senha digitada
        this.passwordDisplay = this.add.text(
            sizes.width / 2, sizes.height / 2 - 40,
            '_ _ _', // Placeholder inicial
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '18px',
                color: '#00ff00',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 },
                resolution: 3,
            }
        )
        .setOrigin(0.5)
        .setDepth(101);

        // Botões numéricos (0-9)
        const buttonWidth = 30;
        const buttonHeight = 25;
        const spacing = 5;
        const startX = sizes.width / 2 - (buttonWidth * 1.5 + spacing); // Centralizar 3 botões
        const startY = sizes.height / 2;

        let num = 1;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = startX + col * (buttonWidth + spacing);
                const y = startY + row * (buttonHeight + spacing);

                const button = this.add.text(x, y, `${num}`, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '12px',
                    color: '#ffffff',
                    backgroundColor: '#666666',
                    padding: { x: 5, y: 2 },
                    resolution: 2,
                })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(102)
                .on('pointerdown', () => this.handlePasswordDigit(num.toString(), maxDigits));
                num++;
            }
        }

        // Botão '0'
        const buttonZeroX = startX + (buttonWidth + spacing); // Posição central da linha
        const buttonZeroY = startY + 3 * (buttonHeight + spacing);
        const buttonZero = this.add.text(buttonZeroX, buttonZeroY, '0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#666666',
            padding: { x: 5, y: 2 },
            resolution: 2,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(102)
        .on('pointerdown', () => this.handlePasswordDigit('0', maxDigits));

        // Botão "Limpar"
        const buttonClear = this.add.text(
            startX - (buttonWidth + spacing), buttonZeroY,
            'CLR',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#ffdd00',
                backgroundColor: '#666666',
                padding: { x: 5, y: 2 },
                resolution: 2,
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(102)
        .on('pointerdown', () => {
            this.currentInput = '';
            this.updatePasswordDisplay(maxDigits);
            this.showTextBox("Entrada limpa.");
        });

        // Botão "Enter"
        const buttonEnter = this.add.text(
            startX + 3 * (buttonWidth + spacing), buttonZeroY,
            'OK',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#00ff00',
                backgroundColor: '#444444',
                padding: { x: 5, y: 2 },
                resolution: 2,
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(102)
        .on('pointerdown', () => this.checkPassword());


        // Adiciona um botão "Voltar" ou "Sair do Puzzle"
        this.exitPasswordPuzzleButton = this.add.text(
            sizes.width - 70, 20, // Posição
            '[Sair]', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#ffff00',
                padding: { x: 5, y: 2 },
                stroke: '#000000',
                strokeThickness: 2,
                resolution: 2,
            }
        )
        .setInteractive({ useHandCursor: true })
        .setDepth(101)
        .on('pointerdown', () => this.destroyPasswordPuzzle());

        // Armazena referências para os elementos do puzzle para destruição posterior
        this.passwordPuzzleElements = [
            this.passwordDisplay,
            buttonZero, buttonClear, buttonEnter,
            this.exitPasswordPuzzleButton
        ];
        // Adiciona os botões numéricos ao array de elementos
        for (let i = 1; i <= 9; i++) {
            this.passwordPuzzleElements.push(this.children.getByName(`${i}`)); // Certifique-se de que os botões tenham nomes se usar getByName
        }
        // Uma forma mais robusta de pegar todos os botões seria armazená-los em um array ao criar
    }

    // Helper para atualizar o display da senha
    updatePasswordDisplay(maxDigits) {
        let display = this.currentInput;
        while (display.length < maxDigits) {
            display += '_';
        }
        this.passwordDisplay.setText(display);
    }

    // Lida com o clique nos dígitos
    handlePasswordDigit(digit, maxDigits) {
        if (this.currentInput.length < maxDigits) {
            this.currentInput += digit;
            this.updatePasswordDisplay(maxDigits);
        } else {
            this.showTextBox("Máximo de dígitos alcançado.");
        }
    }

    // Verifica a senha
    checkPassword() {
        if (this.currentInput === this.correctPassword) {
            this.showTextBox("SENHA CORRETA! O objeto foi desbloqueado.");
            this.onPasswordSuccess(); // Chama o callback de sucesso
            this.destroyPasswordPuzzle(); // Destrói o puzzle
        } else {
            this.showTextBox("SENHA INCORRETA. Tente novamente.");
            this.currentInput = ''; // Limpa a entrada após erro
            this.updatePasswordDisplay(this.correctPassword.length);
            this.onPasswordFailure(); // Chama o callback de falha
        }
    }

    // Destrói todos os elementos do puzzle
    destroyPasswordPuzzle() {
        this.passwordPuzzleElements.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.passwordPuzzleElements = [];
        this.roomManager.loadRoom(this.roomManager.currentRoom); // Retorna para a sala
    }
}

// Configuração do Phaser
const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.NONE // Evita scaling automático
    },
    render: {
        antialias: false, // Para pixel art
        roundPixels: true // Melhora clareza
    }
};

// Inicia o jogo
const game = new Phaser.Game(config);