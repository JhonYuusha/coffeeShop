$(document).ready(function(){
    
    // Constantes de Configuração
    const SCROLL_DURATION = 600; 
    const HEADER_OFFSET = 100; 
    
    // Mapeamento de preços dos adicionais (mantido)
    const EXTRA_PRICES = {
        'Creme': 2.00,
        'Baunilha': 3.00,
        'Cacau': 1.00
    };

    // BASE DE DADOS DE PRODUTOS SIMULADA (mantida)
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

    // VARIÁVEIS DE ESTADO
    let cart = []; 
    let currentProductData = null; 
    
    // Inicializações (mantidas)
    $(window).on('beforeunload', function() { $('html, body').scrollTop(0); });
    if (window.location.hash === '') { $('html, body').animate({ scrollTop: 0 }, 300); }
    AOS.init({ duration: 600, once: true });
    
    // Funcionalidade do Menu (mantida)
    $('#menu-btn').on('click', function(){
        $('.navbar').toggleClass('active');
        $('body').toggleClass('no-scroll'); 
    });
    $('.navbar a').on('click', function(){
        $('.navbar').removeClass('active');
        $('body').removeClass('no-scroll');
    });

    // Scroll Suave (mantido)
    $('a[href*="#"]').on('click', function(e){
        let target = $(this).attr('href');
        if (target === '#' || target === '') {
            e.preventDefault();
            return; 
        }
        // Se for um link interno (exceto links de fechar modal), faz o scroll
        if (!$(this).hasClass('close-modal-link') && target.startsWith('#')) {
             e.preventDefault();
             $('html, body').animate({
                 scrollTop: $(target).offset().top - HEADER_OFFSET
             }, SCROLL_DURATION); 
        }
    });

    // Back to Top (mantido)
    var $backToTop = $('#back-to-top');
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            $backToTop.fadeIn(300); 
        } else {
            $backToTop.fadeOut(300); 
        }
    });

    // Slick Carousel (mantido)
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
    
    // ===================================================
    // LÓGICA DE MODAIS E CARRINHO (ATUALIZADA)
    // ===================================================

    // Funções auxiliares para Modais
    function openModal(selector) {
        // Fecha qualquer modal aberto antes de abrir o novo
        $('.modal.active').removeClass('active'); 

        $(selector).addClass('active');
        $('body').addClass('no-scroll');
        // Reset da animação para garantir que ela dispare
        $(selector + ' .modal-content').css('transform', 'translateY(-50px)');
        setTimeout(() => $(selector + ' .modal-content').css('transform', 'translateY(0)'), 10);
    }
    
    function closeModal(selector) {
        $(selector + ' .modal-content').css('transform', 'translateY(-50px)'); 
        
        setTimeout(() => {
            $(selector).removeClass('active');
            // Remove a classe no-scroll do body apenas se nenhum modal estiver aberto
            if (!$('#cart-modal').hasClass('active') && !$('#product-modal').hasClass('active') && !$('#checkout-modal').hasClass('active')) {
                 $('body').removeClass('no-scroll');
            }
            $(selector + ' .modal-content').css('transform', ''); 
        }, 300); 
    }

    function showFeedback(message) {
        const $feedback = $('#purchase-feedback');
        $feedback.text(message);
        $feedback.removeClass('show'); 
        void $feedback[0].offsetWidth; 
        $feedback.addClass('show');

        setTimeout(function(){
            $feedback.removeClass('show');
        }, 3000); 
    }
    
    // 6. ABRIR O MODAL DE DETALHES
    $('.add-to-cart').on('click', function(e){
        e.preventDefault();
        
        const productId = $(this).closest('.box').data('item-name');
        currentProductData = PRODUCTS_DATA[productId];

        if (!currentProductData) {
            console.error('Produto não encontrado:', productId);
            return;
        }

        // 1. Preenche o Modal com dados
        $('#modal-title').text(currentProductData.name);
        $('#modal-description').text(currentProductData.description);
        $('#modal-image').attr('src', currentProductData.image);
        
        // 2. Preenche as opções de Tamanho
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
        
        // 3. Verifica se tem adicionais (Normalmente só bebidas)
        const hasExtras = currentProductData.sizes.length > 0 && 
                          (currentProductData.sizes[0].name.toLowerCase().includes('ml') || 
                          currentProductData.sizes[0].name.toLowerCase().includes('dose'));

        
        if (hasExtras) {
            $('#extra-options').closest('h4').show(); 
            $('#extra-options').show();
            // Limpa as seleções anteriores
            $('#extra-options input[type="checkbox"]').prop('checked', false); 
        } else {
            $('#extra-options').closest('h4').hide(); 
            $('#extra-options').hide();
        }
        
        // 4. Exibe o Modal e recalcula o preço inicial
        openModal('#product-modal');
        updateModalPrice();
    });

    // 7. LÓGICA DE CÁLCULO DE PREÇO DINÂMICO E FEEDBACK EMOTE
    $('#product-options-form').on('change', 'input[type="radio"], input[type="checkbox"]', function() {
        updateModalPrice();
        
        // Feedback Emote (Apenas para seleção de tamanho)
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
        // Pega o multiplicador do radio button marcado
        let selectedMultiplier = parseFloat($('#size-options input[name="size"]:checked').val() || 1.0); 
        let finalPrice = basePrice * selectedMultiplier;
        let selectedSizeLabel = $('#size-options input[name="size"]:checked').data('label');
        
        // Adiciona preço dos extras
        $('#extra-options input[name="extra"]:checked').each(function() {
            const extraPrice = parseFloat($(this).data('price')) || 0;
            finalPrice += extraPrice;
        });

        $('#modal-final-price').text(`R$ ${finalPrice.toFixed(2).replace('.', ',')}`);
        // Habilita o botão se o tamanho foi selecionado (útil para produtos com múltiplos tamanhos)
        $('.add-to-cart-final').prop('disabled', !selectedSizeLabel); 
    }
    
    // 8. LÓGICA FINAL DE ADIÇÃO AO CARRINHO (Modal Produto)
    $('#product-options-form').on('submit', function(e) {
        e.preventDefault();

        const selectedSizeInput = $('#size-options input[name="size"]:checked');
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
        
        // Formata o nome para exibição no carrinho/checkout
        const extrasDisplay = extras.length ? ' c/ ' + extras.join(', ') : '';
        const itemNameWithDetails = `${currentProductData.name} (${selectedSizeLabel})${extrasDisplay}`;

        cart.push({ 
            name: itemNameWithDetails, 
            price: finalPrice, 
            details: { size: selectedSizeLabel, extras: extras }
        });

        const $cartCountElement = $('.cart-count');
        $cartCountElement.text(cart.length);
        $cartCountElement.addClass('pulse-cart');
        setTimeout(() => $cartCountElement.removeClass('pulse-cart'), 500); 
        
        showFeedback(`✅ ${currentProductData.name} adicionado!`);

        closeModal('#product-modal');
    });

    // 9. LÓGICA DE ABRIR O MODAL DO CARRINHO
    $('#cart-icon').on('click', function(){
        updateCartModal(); 
        openModal('#cart-modal');
    });

    // Lógica de Fechar Modais (para todos)
    $('.close-modal').on('click', function(){
        const modalId = $(this).closest('.modal-content').parent().attr('id');
        closeModal(`#${modalId}`);
    });

    // Função para renderizar os itens no modal do carrinho
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
            
            // Agrupa os itens idênticos (nome e preço) para exibição limpa
            const itemCounts = cart.reduce((acc, item) => {
                const key = `${item.name}|${item.price.toFixed(2)}`;
                if (!acc[key]) {
                    acc[key] = { ...item, quantity: 0 };
                }
                acc[key].quantity += 1;
                return acc;
            }, {});

            // Renderiza itens agrupados
            Object.values(itemCounts).forEach(item => {
                const subtotal = item.price * item.quantity;
                totalSum += subtotal; // Soma o subtotal

                const itemHtml = `
                    <div class="cart-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">x${item.quantity}</span>
                        <span class="item-subtotal">R$ ${(subtotal).toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
                $content.append(itemHtml);
            });
            
            // Recalcula o total (a soma acima está somando o subtotal, então o total está correto)
            totalSum = Object.values(itemCounts).reduce((acc, item) => acc + (item.price * item.quantity), 0);
        }

        $total.text(`R$ ${totalSum.toFixed(2).replace('.', ',')}`);
    }
    
    // 10. LÓGICA DE ABRIR O MODAL DE CHECKOUT
    $('#cart-modal').on('click', '.open-checkout-modal', function(e) {
        e.preventDefault();
        if (cart.length === 0) return; // Garante que só abre se houver itens

        closeModal('#cart-modal');
        prepareCheckoutModal();
        openModal('#checkout-modal');
    });

    function prepareCheckoutModal() {
        const $summaryItems = $('#checkout-summary-items');
        let totalSum = 0;
        
        $summaryItems.empty();
        
        // Agrupa e mostra os itens como no carrinho
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
        $('#checkout-form').trigger('reset'); // Limpa campos de entrega e pagamento
    }
    
    // 11. LÓGICA DE PAGAMENTO E SUBMISSÃO DO CHECKOUT
    $('#checkout-form').on('change', 'input[name="payment-method"]', function() {
        const method = $(this).val();
        const $detailsArea = $('#payment-details-area');
        // Pega o total do display, converte para float
        const totalText = $('#checkout-total').text().replace('R$ ', '').replace(',', '.');
        const total = parseFloat(totalText); 
        
        $detailsArea.empty();
        $detailsArea.show();

        if (method === 'PIX') {
            $detailsArea.html(`
                <p>O PIX é de **R$ ${total.toFixed(2).replace('.', ',')}**.</p>
                <span class="qr-code-placeholder">QR CODE SIMULADO (Chave: Café Expresso)</span>
                <p>Escaneie o código para concluir a simulação de pagamento.</p>
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
            // Limpeza e Confirmação
            cart = [];
            $('.cart-count').text(0);
            
            $submitBtn.hide();
            $messageArea.html('<i class="fas fa-check-circle"></i> Seu pedido foi confirmado e está sendo preparado! Agradecemos a preferência.').fadeIn(500);

            // Fecha o modal de checkout após 4 segundos e leva ao topo
            setTimeout(() => {
                closeModal('#checkout-modal');
                $('html, body').animate({ scrollTop: 0 }, SCROLL_DURATION); 
            }, 4000);

        }, 1500); // 1.5s de delay para simular o envio/processamento
    });


    // 12. FEEDBACK DO FORMULÁRIO DE CONTATO (VOLTOU A SER RESERVA/CONTATO)
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