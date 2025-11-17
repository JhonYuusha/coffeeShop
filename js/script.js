$(document).ready(function(){
    
    // Constantes de Configuração
    const SCROLL_DURATION = 600; 
    const HEADER_OFFSET = 100; 
    // Mapeamento de preços dos adicionais
    const EXTRA_PRICES = {
        'creme': 2.00,
        'baunilha': 3.00,
        'cacau': 1.00
    };

    // BASE DE DADOS DE PRODUTOS SIMULADA
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
        // Itens que não são bebidas não têm opções de tamanho/extras, mas precisam estar na base de dados
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
    
    // 0. SCROLL SUAVE NO REFRESH (F5)
    $(window).on('beforeunload', function() {
        $('html, body').scrollTop(0);
    });
    if (window.location.hash === '') {
        $('html, body').animate({
            scrollTop: 0
        }, 300); 
    }

    // 1. INICIALIZAÇÃO DO AOS (Animate On Scroll)
    AOS.init({
        duration: 600, 
        once: true,    
    });

    // 2. FUNCIONALIDADE DO MENU HAMBÚRGUER
    $('#menu-btn').on('click', function(){
        $('.navbar').toggleClass('active');
        $('body').toggleClass('no-scroll'); 
    });
    
    // Fechar menus ao clicar em um link
    $('.navbar a').on('click', function(){
        $('.navbar').removeClass('active');
        $('body').removeClass('no-scroll');
    });

    // 3. ANIMAÇÃO DE SCROLL SUAVE (Smooth Scroll)
    $('a[href*="#"]').on('click', function(e){
        let target = $(this).attr('href');
        if (target === '#' || target === '' || target.startsWith('#')) {
            // Permite que links de finalização de pedido para #contato fechem o modal
            if ($(this).hasClass('close-modal')) {
                closeModal('#cart-modal');
            }
            if (target === '#' || target === '') {
                e.preventDefault();
                return; 
            }
        }
        e.preventDefault();
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - HEADER_OFFSET
        }, SCROLL_DURATION); 
    });


    // 4. LÓGICA DO BOTÃO VOLTAR AO TOPO (Back to Top)
    var $backToTop = $('#back-to-top');
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 300) {
            $backToTop.fadeIn(300); 
        } else {
            $backToTop.fadeOut(300); 
        }
    });

    // 5. INICIALIZAÇÃO DO SLICK CAROUSEL
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

    // 6. ABRIR O MODAL DE DETALHES (Novo Comportamento do Botão "Comprar")
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
        const hasExtras = currentProductData.sizes.length > 0 && currentProductData.sizes[0].name.toLowerCase().includes('ml');
        
        if (hasExtras) {
            $('#extra-options').closest('h4').show(); // Mostra o título "Adicionais"
            $('#extra-options').show();
            $('#extra-options input[type="checkbox"]').prop('checked', false);
        } else {
            $('#extra-options').closest('h4').hide(); // Esconde o título "Adicionais"
            $('#extra-options').hide();
        }
        
        // 4. Exibe o Modal e recalcula o preço inicial
        $('#product-modal').addClass('active');
        $('body').addClass('no-scroll');
        updateModalPrice();
    });

    // 7. LÓGICA DE CÁLCULO DE PREÇO DINÂMICO NO MODAL
    $('#product-options-form').on('change', 'input[type="radio"], input[type="checkbox"]', updateModalPrice);

    function updateModalPrice() {
        if (!currentProductData) return;

        let basePrice = currentProductData.basePrice;
        let selectedMultiplier = parseFloat($('#size-options input[name="size"]:checked').val() || 1.0);
        let finalPrice = basePrice * selectedMultiplier;
        let selectedSizeLabel = $('#size-options input[name="size"]:checked').data('label');
        
        // Adiciona preço dos extras
        $('#extra-options input[name="extra"]:checked').each(function() {
            const extraPrice = parseFloat($(this).data('price')) || 0;
            finalPrice += extraPrice;
        });

        $('#modal-final-price').text(`R$ ${finalPrice.toFixed(2).replace('.', ',')}`);
        
        // O botão de adição fica ativo se um tamanho estiver selecionado (o que é garantido pelo 'checked' padrão)
        $('.add-to-cart-final').prop('disabled', !selectedSizeLabel); 
    }
    
    // 8. LÓGICA FINAL DE ADIÇÃO AO CARRINHO (Botão dentro do Modal)
    $('#product-options-form').on('submit', function(e) {
        e.preventDefault();

        const selectedSizeInput = $('#size-options input[name="size"]:checked');
        const selectedSizeLabel = selectedSizeInput.data('label');
        
        let extras = [];
        let extraCost = 0;

        // Coleta extras e calcula o custo adicional
        $('#extra-options input[name="extra"]:checked').each(function() {
            const extraValue = $(this).val();
            const price = parseFloat($(this).data('price')) || 0;
            extras.push(extraValue);
            extraCost += price;
        });

        // Recalcula o preço final com precisão
        const basePrice = currentProductData.basePrice;
        const multiplier = parseFloat(selectedSizeInput.val());
        const finalPrice = (basePrice * multiplier) + extraCost;
        
        // Nome para exibição no carrinho
        const extrasDisplay = extras.length ? ' c/ ' + extras.join(', ') : '';
        const itemNameWithDetails = `${currentProductData.name} (${selectedSizeLabel})${extrasDisplay}`;

        // 1. Adiciona o item formatado à lista do carrinho
        cart.push({ 
            name: itemNameWithDetails, 
            price: finalPrice, 
            details: { size: selectedSizeLabel, extras: extras }
        });

        // 2. Atualiza o contador com animação
        const $cartCountElement = $('.cart-count');
        $cartCountElement.text(cart.length);
        $cartCountElement.addClass('pulse-cart');
        setTimeout(() => $cartCountElement.removeClass('pulse-cart'), 500); 
        
        // 3. Mostra a mensagem de feedback
        showFeedback(`✅ ${currentProductData.name} (${selectedSizeLabel}) adicionado ao seu pedido!`);

        // 4. Fecha o modal
        closeModal('#product-modal');
    });

    // Função auxiliar para fechar qualquer modal
    function closeModal(selector) {
        // Aplica a classe para animar a saída (efeito reverso)
        $(selector + ' .modal-content').css('transform', 'translateY(-50px)'); 
        
        setTimeout(() => {
            $(selector).removeClass('active');
            // Remove a classe no-scroll do body apenas se nenhum modal estiver aberto
            if (!$('#cart-modal').hasClass('active') && !$('#product-modal').hasClass('active')) {
                 $('body').removeClass('no-scroll');
            }
            // Reseta a transformação para que a próxima abertura anime corretamente
            $(selector + ' .modal-content').css('transform', ''); 
        }, 300); // Deve ser igual ou maior que a transição no CSS
    }

    // Função auxiliar para mostrar feedback de compra
    function showFeedback(message) {
        const $feedback = $('#purchase-feedback');
        $feedback.text(message);
        
        // Reinicia a animação CSS (truque)
        $feedback.removeClass('show'); 
        void $feedback[0].offsetWidth; 
        $feedback.addClass('show');

        setTimeout(function(){
            $feedback.removeClass('show');
        }, 3000); 
    }
    
    // 9. LÓGICA DE ABRIR O MODAL DO CARRINHO
    $('#cart-icon').on('click', function(){
        updateCartModal(); 
        $('#cart-modal').addClass('active');
        $('body').addClass('no-scroll');
    });

    // Lógica de Fechar Modais (para ambos)
    $('.close-modal').on('click', function(){
        const modalId = $(this).closest('.modal-content').parent().attr('id');
        closeModal(`#${modalId}`);
    });

    // Função para renderizar os itens no modal do carrinho
    function updateCartModal() {
        const $content = $('#cart-items');
        const $total = $('#cart-total');
        
        $content.empty(); 
        let totalSum = 0;

        if (cart.length === 0) {
            $content.append('<p class="empty-cart-message">Seu carrinho está vazio. Adicione um café!</p>');
            $('.checkout-btn').prop('disabled', true).text('Carrinho Vazio');
        } else {
            $('.checkout-btn').prop('disabled', false).text('Finalizar Pedido');
            
            // Agrupa os itens idênticos (nome e preço)
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
                totalSum += subtotal;

                const itemHtml = `
                    <div class="cart-item">
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">x${item.quantity}</span>
                        <span class="item-subtotal">R$ ${(subtotal).toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
                $content.append(itemHtml);
            });
        }

        $total.text(`R$ ${totalSum.toFixed(2).replace('.', ',')}`);
    }


    // 10. FEEDBACK DO FORMULÁRIO DE CONTATO (SIMULADO como Checkout)
    $('.contato form').on('submit', function(e){
        e.preventDefault();
        
        // Simula o processamento da mensagem/pedido
        setTimeout(function(){
            
            // 1. Limpa os campos do formulário
            $('.contato form').trigger('reset');

            // 2. Reseta o carrinho
            cart = [];
            $('.cart-count').text(0);

            // 3. Mostra a mensagem de sucesso
            $('.mensagem-sucesso').text('Seu pedido foi finalizado com sucesso! Em breve entraremos em contato.').fadeIn(500);
            
            setTimeout(function(){
                $('.mensagem-sucesso').fadeOut(500);
            }, 5000); 

        }, 500); 
    });
    
});