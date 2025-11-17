$(document).ready(function(){
    
    // --- Variáveis e Constantes Globais ---
    const SCROLL_DURATION = 600; 
    const HEADER_OFFSET = 100; 
    
    const PRODUCTS_DATA = {
        'Latte Macchiato': {
            name: 'Latte Macchiato Suave',
            description: 'Camadas de leite cremoso, espresso intenso e uma pitada de baunilha. Suavidade em cada gole, perfeito para quem busca conforto.',
            image: 'images/latte.jpg', 
            basePrice: 15.00,
            sizes: [
                { name: 'Pequeno (200ml)', multiplier: 1.0, dataSize: 'pequeno' },
                { name: 'Médio (300ml)', multiplier: 1.3, dataSize: 'medio' },
                { name: 'Grande (450ml)', multiplier: 1.6, dataSize: 'grande' }
            ]
        },
        'Café Expresso': {
            name: 'Café Expresso da Casa',
            description: 'Dose única de grãos especiais, torra média. Sabor forte e aromático para começar o dia ou dar um gás na tarde.',
            image: 'images/expresso.jpg',
            basePrice: 8.00,
            sizes: [
                { name: 'Dose Simples (30ml)', multiplier: 1.0, dataSize: 'pequeno' },
                { name: 'Dose Dupla (60ml)', multiplier: 1.5, dataSize: 'medio' }
            ]
        },
        'Capuccino Clássico': {
            name: 'Capuccino dos Sonhos',
            description: 'Se você gosta de café mais docinho, esse é para você! Combinação suave de espresso, leite cremoso e uma pitada de cacau. Nosso campeão de vendas.',
            image: 'images/capuccino.jpg',
            basePrice: 18.00,
            sizes: [
                { name: 'Pequeno (200ml)', multiplier: 1.0, dataSize: 'pequeno' },
                { name: 'Médio (300ml)', multiplier: 1.3, dataSize: 'medio' },
                { name: 'Grande (450ml)', multiplier: 1.6, dataSize: 'grande' }
            ]
        },
        'Bolo de Chocolate': {
            name: 'Bolo de Chocolate Delicioso',
            description: 'Fatia molhadinha e intensa. Adoce seu dia!',
            image: 'images/bolo.jpg',
            basePrice: 12.00,
            sizes: [{ name: 'Fatia Única', multiplier: 1.0, dataSize: 'medio' }]
        },
        'Waffle com Frutas': {
            name: 'Waffle com Frutas e Mel',
            description: 'Waffle quentinho, frutas frescas e calda de mel.',
            image: 'images/waffle.jpg',
            basePrice: 22.00,
            sizes: [{ name: 'Porção Individual', multiplier: 1.0, dataSize: 'medio' }]
        },
        'Sanduíche de Peito de Peru': {
            name: 'Sanduíche Natural de Peru',
            description: 'Opção leve e fresca para seu almoço ou lanche da tarde.',
            image: 'images/sanduiche.jpg',
            basePrice: 16.00,
            sizes: [{ name: 'Sanduíche Completo', multiplier: 1.0, dataSize: 'medio' }]
        },
    };

    let cart = []; 
    let currentProductData = null; 
    
    // --- Inicialização e Comportamento Global ---
    
    // Força o scroll para o topo ao recarregar a página (melhora UX ao voltar)
    $(window).on('beforeunload', function() { $('html, body').scrollTop(0); });
    // Scroll inicial suave para o topo
    if (window.location.hash === '') { $('html, body').animate({ scrollTop: 0 }, 300); }
    
    // Inicialização do AOS
    AOS.init({ duration: 600, once: true });
    
    // Menu Mobile
    $('#menu-btn').on('click', function(){
        $('.navbar').toggleClass('active');
        $('body').toggleClass('no-scroll'); 
    });
    $('.navbar a').on('click', function(){
        $('.navbar').removeClass('active');
        $('body').removeClass('no-scroll');
    });

    // Scroll Suave
    $('a[href*="#"]').on('click', function(e){
        let target = $(this).attr('href');
        if (target === '#' || target === '') {
            e.preventDefault();
            return; 
        }
        if (!$(this).hasClass('close-modal-link') && target.startsWith('#')) {
             e.preventDefault();
             $('html, body').animate({
                 scrollTop: $(target).offset().top - HEADER_OFFSET
             }, SCROLL_DURATION); 
        }
    });

    // Botão de Voltar ao Topo
    var $backToTop = $('#back-to-top');
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            $backToTop.fadeIn(300); 
        } else {
            $backToTop.fadeOut(300); 
        }
    });

    // Slick Carousel para Avaliações
    $('.avaliacoes .slider').slick({
        dots: true, 
        infinite: true,
        speed: 800,
        slidesToShow: 3, 
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000, 
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2, } },
            { breakpoint: 768, settings: { slidesToShow: 1, } }
        ]
    });
    
    // --- Funções Auxiliares para Modais ---
    function openModal(selector) {
        // Garante que apenas um modal fica ativo por vez
        $('.modal.active').removeClass('active'); 

        $(selector).addClass('active');
        $('body').addClass('no-scroll');
        // Animação de entrada
        $(selector + ' .modal-content').css('transform', 'translateY(-50px)');
        setTimeout(() => $(selector + ' .modal-content').css('transform', 'translateY(0)'), 10);
    }
    
    function closeModal(selector) {
        // Animação de saída
        $(selector + ' .modal-content').css('transform', 'translateY(-50px)'); 
        
        setTimeout(() => {
            $(selector).removeClass('active');
            // Remove 'no-scroll' apenas se NENHUM modal mais estiver ativo
            if ($('#cart-modal').hasClass('active') || $('#product-modal').hasClass('active') || $('#checkout-modal').hasClass('active')) {
                 // Deixa no-scroll ativo se outro modal estiver aberto
            } else {
                $('body').removeClass('no-scroll');
            }
            $(selector + ' .modal-content').css('transform', ''); 
        }, 300); 
    }

    function showFeedback(message) {
        const $feedback = $('#purchase-feedback');
        $feedback.text(message);
        $feedback.removeClass('show'); 
        // Força reflow para garantir a animação
        void $feedback[0].offsetWidth; 
        $feedback.addClass('show');

        setTimeout(function(){
            $feedback.removeClass('show');
        }, 3000); 
    }
    
    // --- Lógica do Modal de Detalhes do Produto ---
    
    // ABRIR O MODAL DE DETALHES
    $('.add-to-cart').on('click', function(e){
        e.preventDefault();
        
        const productId = $(this).closest('.box').data('item-name');
        currentProductData = PRODUCTS_DATA[productId];

        if (!currentProductData) {
            console.error('Produto não encontrado:', productId);
            return;
        }

        $('#modal-title').text(currentProductData.name);
        $('#modal-description').text(currentProductData.description);
        $('#modal-image').attr('src', currentProductData.image);
        
        let sizeOptionsHtml = '';
        currentProductData.sizes.forEach((size, index) => {
            const price = (currentProductData.basePrice * size.multiplier).toFixed(2).replace('.', ',');
            
            sizeOptionsHtml += `
                <label data-size="${size.dataSize}">
                    <input type="radio" name="size" value="${size.multiplier}" data-label="${size.name}" ${index === 0 ? 'checked' : ''}> 
                    ${size.name} - R$ ${price} 
                </label>
            `;
        });
        $('#size-options').html(sizeOptionsHtml);
        
        // Lógica para esconder/mostrar adicionais se o item não for uma bebida
        const isDrink = currentProductData.sizes.some(size => 
            size.name.toLowerCase().includes('ml') || 
            size.name.toLowerCase().includes('dose')
        );

        if (isDrink) {
            $('#extra-options').closest('h4').show(); 
            $('#extra-options').show();
            $('#extra-options input[type="checkbox"]').prop('checked', false); 
        } else {
            $('#extra-options').closest('h4').hide(); 
            $('#extra-options').hide();
            $('#extra-options input[type="checkbox"]').prop('checked', false); // Garantir que são desmarcados
        }
        
        openModal('#product-modal');
        updateModalPrice();
    });

    // LÓGICA DE CÁLCULO DE PREÇO DINÂMICO E FEEDBACK EMOTE
    $('#product-options-form').on('change', 'input[type="radio"], input[type="checkbox"]', function() {
        updateModalPrice();
        
        // Feedback Emote ao selecionar tamanho
        if ($(this).attr('name') === 'size') {
            const selectedSize = $(this).closest('label').data('size');
            let emote = '';
            if (selectedSize === 'pequeno') emote = '🙁';
            else if (selectedSize === 'medio') emote = '🙂';
            else if (selectedSize === 'grande') emote = '🥳';

            if (emote) {
                showFeedback(`Tamanho ${selectedSize.toUpperCase()} selecionado! ${emote}`);
            }
        }
    });

    function updateModalPrice() {
        if (!currentProductData) return;

        let basePrice = currentProductData.basePrice;
        // Pega o multiplicador do tamanho selecionado
        let selectedMultiplier = parseFloat($('#size-options input[name="size"]:checked').val() || 1.0); 
        let finalPrice = basePrice * selectedMultiplier;
        let selectedSizeLabel = $('#size-options input[name="size"]:checked').data('label');
        
        // Adiciona custo dos extras
        $('#extra-options input[name="extra"]:checked').each(function() {
            const extraPrice = parseFloat($(this).data('price')) || 0;
            finalPrice += extraPrice;
        });

        $('#modal-final-price').text(`R$ ${finalPrice.toFixed(2).replace('.', ',')}`);
        // Desativa botão se nenhum tamanho estiver selecionado (apesar de termos um default)
        $('.add-to-cart-final').prop('disabled', !selectedSizeLabel); 
    }
    
    // LÓGICA FINAL DE ADIÇÃO AO CARRINHO
    $('#product-options-form').on('submit', function(e) {
        e.preventDefault();

        const selectedSizeInput = $('#size-options input[name="size"]:checked');
        if (selectedSizeInput.length === 0) return; // Deveria ser impossível, mas é um bom check
        
        const selectedSizeLabel = selectedSizeInput.data('label');
        
        let extras = [];
        let extraCost = 0;

        $('#extra-options input[name="extra"]:checked').each(function() {
            const extraValue = $(this).val();
            const price = parseFloat($(this).data('price')) || 0;
            extras.push(extraValue);
            extraCost += price;
        });

        const basePrice = currentProductData.basePrice;
        const multiplier = parseFloat(selectedSizeInput.val());
        const finalPrice = (basePrice * multiplier) + extraCost;
        
        const extrasDisplay = extras.length ? ' c/ ' + extras.join(', ') : '';
        const itemNameWithDetails = `${currentProductData.name} (${selectedSizeLabel})${extrasDisplay}`;

        // Objeto de item do carrinho
        cart.push({ 
            name: itemNameWithDetails, 
            price: finalPrice, 
            details: { 
                name: currentProductData.name, // Para simplificar remoção se necessário
                basePrice: currentProductData.basePrice,
                sizeLabel: selectedSizeLabel, 
                extras: extras 
            }
        });

        // Atualiza ícone do carrinho
        const $cartCountElement = $('.cart-count');
        $cartCountElement.text(cart.length);
        $cartCountElement.addClass('pulse-cart');
        setTimeout(() => $cartCountElement.removeClass('pulse-cart'), 500); 
        
        showFeedback(`✅ ${currentProductData.name} adicionado!`);

        closeModal('#product-modal');
    });

    // --- Lógica do Modal do Carrinho ---
    
    // ABRIR O MODAL DO CARRINHO
    $('#cart-icon').on('click', function(){
        updateCartModal(); 
        openModal('#cart-modal');
    });

    // Lógica de Fechar Modais (para todos)
    $('.close-modal').on('click', function(){
        const modalId = $(this).closest('.modal-content').parent().attr('id');
        closeModal(`#${modalId}`);
    });

    // Função para renderizar os itens no modal do carrinho (agrupados)
    function updateCartModal() {
        const $content = $('#cart-items');
        const $total = $('#cart-total');
        const $checkoutBtn = $('#checkout-btn-cart');
        
        $content.empty(); 
        let totalSum = 0;

        if (cart.length === 0) {
            $content.append('<p class="empty-cart-message">Seu carrinho está vazio. Adicione um café!</p>');
            $checkoutBtn.hide(); 
        } else {
            $checkoutBtn.show(); 
            
            // Agrupa itens repetidos
            const itemCounts = cart.reduce((acc, item) => {
                // Chave única baseada no nome detalhado e preço final
                const key = `${item.name}|${item.price.toFixed(2)}`;
                if (!acc[key]) {
                    acc[key] = { ...item, quantity: 0, indexReferences: [] };
                }
                // Armazena as referências de índice original (para remoção)
                acc[key].indexReferences.push(cart.indexOf(item)); 
                acc[key].quantity += 1;
                return acc;
            }, {});

            Object.values(itemCounts).forEach(item => {
                const subtotal = item.price * item.quantity;
                totalSum += subtotal;

                // Index reference é o primeiro item original para identificar o "grupo"
                const firstIndex = item.indexReferences[0]; 

                const itemHtml = `
                    <div class="cart-item" data-item-group-key="${firstIndex}">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">x${item.quantity}</span>
                        </div>
                        <div class="item-actions">
                            <span class="item-subtotal">R$ ${(subtotal).toFixed(2).replace('.', ',')}</span>
                            <button class="remove-item-btn fas fa-trash-alt" data-index-to-remove="${firstIndex}" title="Remover item"></button>
                        </div>
                    </div>
                `;
                $content.append(itemHtml);
            });
        }

        $total.text(`R$ ${totalSum.toFixed(2).replace('.', ',')}`);
        // Atualiza a contagem do ícone
        $('.cart-count').text(cart.length);
    }

    // LÓGICA DE REMOÇÃO DE ITEM DO CARRINHO (NOVO)
    $('#cart-modal').on('click', '.remove-item-btn', function() {
        // Encontra a chave do grupo no DOM
        const $itemContainer = $(this).closest('.cart-item');
        const groupKey = $itemContainer.data('item-group-key'); 

        // Encontra o item original (apenas para pegar o nome)
        const itemToRemove = cart[groupKey];
        if (!itemToRemove) return;

        // Filtra o carrinho, removendo APENAS a primeira ocorrência do item
        // Isto simula a remoção de "uma unidade" do grupo
        let removedOne = false;
        cart = cart.filter(item => {
            // Verifica se o item atual é o que queremos remover e se ainda não removemos um
            if (!removedOne && item.name === itemToRemove.name && item.price === itemToRemove.price) {
                removedOne = true; // Remove esta ocorrência
                return false;
            }
            return true; // Mantém todas as outras
        });

        showFeedback(`❌ Uma unidade de ${itemToRemove.name.split('(')[0].trim()} removida.`);
        
        // Re-renderiza o modal
        updateCartModal(); 
    });
    
    // LÓGICA DE ABRIR O MODAL DE CHECKOUT
    $('#cart-modal').on('click', '.open-checkout-modal', function(e) {
        e.preventDefault();
        if (cart.length === 0) return;

        closeModal('#cart-modal');
        prepareCheckoutModal();
        openModal('#checkout-modal');
    });

    function prepareCheckoutModal() {
        const $summaryItems = $('#checkout-summary-items');
        let totalSum = 0;
        
        $summaryItems.empty();
        
        // Recria a contagem agrupada para o resumo
        const itemCounts = cart.reduce((acc, item) => {
            const key = `${item.name}|${item.price.toFixed(2)}`;
            if (!acc[key]) {
                acc[key] = { ...item, quantity: 0 };
            }
            acc[key].quantity += 1;
            return acc;
        }, {});

        Object.values(itemCounts).forEach(item => {
            const subtotal = item.price * item.quantity;
            totalSum += subtotal; 

            $summaryItems.append(`
                <div class="cart-item">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">x${item.quantity}</span>
                    <span class="item-subtotal">R$ ${(subtotal).toFixed(2).replace('.', ',')}</span>
                </div>
            `);
        });
        
        $('#checkout-total').text(`R$ ${totalSum.toFixed(2).replace('.', ',')}`);
        $('#payment-details-area').hide().empty();
        $('#payment-success-message').hide();
        $('.checkout-submit-btn').show().prop('disabled', false).text('Confirmar Pedido');
        $('#checkout-form').trigger('reset');
    }
    
    // LÓGICA DE PAGAMENTO E SUBMISSÃO DO CHECKOUT
    $('#checkout-form').on('change', 'input[name="payment-method"]', function() {
        const method = $(this).val();
        const $detailsArea = $('#payment-details-area');
        // Pega o valor total, remove R$ e substitui vírgula por ponto para parse
        const totalText = $('#checkout-total').text().replace('R$ ', '').replace(',', '.');
        const total = parseFloat(totalText); 
        
        $detailsArea.empty();
        $detailsArea.show();

        if (method === 'PIX') {
            // Usa o QR Code que você uploadou
            $detailsArea.html(`
                <p>O PIX é de **R$ ${total.toFixed(2).replace('.', ',')}**.</p>
                <img src="images/qrcode.png" alt="QR Code PIX Simulado" class="qr-code-placeholder">
                <p style="margin-top: 1.5rem;">Escaneie o código para concluir a simulação de pagamento.</p>
                <p style="font-size: 1.2rem; font-weight: 600;">Chave: Café Expresso</p>
            `);
        } else if (method === 'Dinheiro (Entrega)') {
            $detailsArea.html(`
                <p>Pagamento em Dinheiro (Na Entrega).</p>
                <input type="number" placeholder="Precisa de troco para quanto? (Opcional)" class="box" name="troco" style="margin-top: 1rem;">
                <p>Valor total: R$ ${total.toFixed(2).replace('.', ',')}</p>
            `);
        } else { // Cartão (Entrega)
            $detailsArea.html('<p>Pagamento com **Cartão de Crédito/Débito** na máquina que será levada pelo entregador.</p>');
        }
    });

    $('#checkout-form').on('submit', function(e) {
        e.preventDefault();
        
        const $submitBtn = $('.checkout-submit-btn');
        const $messageArea = $('#payment-success-message');

        $submitBtn.prop('disabled', true).text('Confirmando...');

        setTimeout(function() {
            // SIMULAÇÃO DE LIMPEZA DO CARRINHO E CONFIRMAÇÃO
            cart = [];
            $('.cart-count').text(0);
            
            $submitBtn.hide();
            $messageArea.html('<i class="fas fa-check-circle"></i> Seu pedido foi confirmado e está sendo preparado! Agradecemos a preferência.').fadeIn(500);

            // Fecha o modal e volta ao topo após a confirmação
            setTimeout(() => {
                closeModal('#checkout-modal');
                $('html, body').animate({ scrollTop: 0 }, SCROLL_DURATION); 
            }, 4000);

        }, 1500); 
    });


    // FEEDBACK DO FORMULÁRIO DE CONTATO 
    $('.contato form').on('submit', function(e){
        e.preventDefault();
        
        setTimeout(function(){
            $('.mensagem-sucesso').text('Sua mensagem/reserva foi enviada, logo entraremos em contato!').fadeIn(500);
            $('.contato form').trigger('reset');
            
            setTimeout(function(){
                $('.mensagem-sucesso').fadeOut(500);
            }, 5000); 

        }, 500); 
    });
    
});