$(document).ready(function(){
    
    // Constantes de Performance
    // SCROLL DURATION: Mantido em 600ms para um movimento lento e suave.
    const SCROLL_DURATION = 600; 
    const HEADER_OFFSET = 100; 
    
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
    
    // Fecha o menu ao clicar em um link
    $('.navbar a').on('click', function(){
        $('.navbar').removeClass('active');
        $('body').removeClass('no-scroll');
    });

    // 3. ANIMAÇÃO DE SCROLL SUAVE (Smooth Scroll)
    $('a[href*="#"]').on('click', function(e){
        e.preventDefault();
        
        let target = $(this).attr('href');
        
        // Aplica a duração de scroll (600ms)
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

    // 5. INICIALIZAÇÃO DO SLICK CAROUSEL (Avaliações)
    $('.avaliacoes .slider').slick({
        dots: true, 
        infinite: true,
        speed: 800,
        slidesToShow: 3, 
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000, 
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    });
    
    // 6. FEEDBACK DO FORMULÁRIO DE CONTATO (SIMULADO)
    $('.contato form').on('submit', function(e){
        e.preventDefault();
        
        // Simula o processamento da mensagem
        setTimeout(function(){
            // 1. Mostra a mensagem de sucesso
            $('.mensagem-sucesso').fadeIn(500);
            
            // 2. Limpa os campos do formulário
            $('.contato form').trigger('reset');
            
            // 3. Esconde a mensagem após 5 segundos
            setTimeout(function(){
                $('.mensagem-sucesso').fadeOut(500);
            }, 5000); 

        }, 500); // 500ms de delay para simular envio
    });
    
});