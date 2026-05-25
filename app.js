/**
 * Burger House — lógica de menú, carrito, horarios y geolocalización.
 * Mantiene el mismo comportamiento que el script inline original.
 */
(function () {
    'use strict';

    const CONFIG = {
        TIMEZONE: 'America/Caracas',
        STORE_LAT: 8.553563,
        STORE_LON: -71.205238,
        WHATSAPP: '584127510090',
        PRELOADER_FALLBACK_MS: 3000,
        WEEKDAY_OPEN: 1020,
        WEEKDAY_CLOSE: 1350,
        WEEKEND_OPEN: 780,
        PROMO_BASE_PRICE: 6.5,
        PROMO_COMBO_PRICE: 8.5,
        PROMO_COMBO_EXTRA: 2.0,
        DELIVERY_MAX_KM: 12
    };

    const getCaracasDate = () =>
        new Date(new Date().toLocaleString('en-US', { timeZone: CONFIG.TIMEZONE }));

    const minutesSinceMidnight = (date) => date.getHours() * 60 + date.getMinutes();

    const isMinutesInRange = (mins, start, end) => mins >= start && mins <= end;

    const isStoreOpenNow = () => {
        const caracas = getCaracasDate();
        const day = caracas.getDay();
        const mins = minutesSinceMidnight(caracas);
        if (day >= 1 && day <= 5) {
            return isMinutesInRange(mins, CONFIG.WEEKDAY_OPEN, CONFIG.WEEKDAY_CLOSE);
        }
        return isMinutesInRange(mins, CONFIG.WEEKEND_OPEN, CONFIG.WEEKDAY_CLOSE);
    };

    const isPromoWindowActive = () => {
        const caracas = getCaracasDate();
        const day = caracas.getDay();
        const mins = minutesSinceMidnight(caracas);
        return (
            day >= 1 &&
            day <= 3 &&
            isMinutesInRange(mins, CONFIG.WEEKDAY_OPEN, CONFIG.WEEKDAY_CLOSE)
        );
    };

    const calcularDistanciaHaversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) ** 2;
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const obtenerCostoDelivery = (distancia) => {
        if (distancia <= 1.2) return 1.0;
        if (distancia <= 2.8) return 1.5;
        if (distancia <= 4.5) return 2.0;
        if (distancia <= 6.5) return 2.5;
        if (distancia <= 9.0) return 3.0;
        if (distancia <= 11.5) return 3.5;
        return 5.0;
    };

    const parsePrice = (priceStr) =>
        parseFloat(priceStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    const lockBodyScroll = (locked) => {
        document.body.style.overflow = locked ? 'hidden' : 'auto';
    };

    document.addEventListener('DOMContentLoaded', () => {
        /* ——— Preloader ——— */
        const preloaderProgress = document.getElementById('preloader-progress');

        const finalizarCarga = () => {
            if (!preloaderProgress || preloaderProgress.dataset.finished === 'true') return;
            preloaderProgress.dataset.finished = 'true';
            preloaderProgress.style.width = '100%';

            setTimeout(() => {
                document.getElementById('preloader')?.classList.add('ocultar');
                document.getElementById('main-menu')?.classList.add('mostrar-menu');
                document.getElementById('cart-floating-btn')?.classList.remove('cart-btn-hidden');
                setTimeout(verificarYMostrarPromo, 1000);
            }, 200);
        };

        const imgs = Array.from(document.querySelectorAll('img'));
        let cargadas = 0;
        const total = imgs.length;

        const incrementarProgreso = () => {
            if (!preloaderProgress || preloaderProgress.dataset.finished === 'true') return;
            cargadas++;
            const porcentaje = total > 0 ? (cargadas / total) * 100 : 100;
            preloaderProgress.style.width = `${Math.min(porcentaje, 99)}%`;
            if (cargadas >= total) finalizarCarga();
        };

        if (total === 0) {
            finalizarCarga();
        } else {
            imgs.forEach((img) => {
                if (img.complete) incrementarProgreso();
                else {
                    img.addEventListener('load', incrementarProgreso);
                    img.addEventListener('error', incrementarProgreso);
                }
            });
        }

        setTimeout(() => {
            if (preloaderProgress?.dataset.finished !== 'true') finalizarCarga();
        }, CONFIG.PRELOADER_FALLBACK_MS);

        /* ——— Horario / tienda cerrada ——— */
        let isPreOrder = false;
        const verificarHorario = () => {
            if (isStoreOpenNow()) return;
            document.getElementById('modal-closed')?.classList.add('active');
            lockBodyScroll(true);
            isPreOrder = true;
        };

        /* ——— Búsqueda y categorías ——— */
        const searchInput = document.getElementById('menu-search');
        searchInput?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.menu-item').forEach((item) => {
                const name = item.querySelector('.item-name')?.innerText.toLowerCase() ?? '';
                const desc = item.querySelector('.item-desc')?.innerText.toLowerCase() ?? '';
                item.classList.toggle('hidden-search', !(name.includes(term) || desc.includes(term)));
            });
            document.querySelectorAll('section').forEach((section) => {
                const hasVisible = Array.from(section.querySelectorAll('.menu-item')).some(
                    (item) => !item.classList.contains('hidden-search')
                );
                section.classList.toggle('hidden-search', !hasVisible);
            });
        });

        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.dataset.category;
                const footer = document.querySelector('.bh-footer');
                if (searchInput) searchInput.value = '';

                document.querySelectorAll('#main-menu section').forEach((section) => {
                    if (category === 'all' || section.id === category) {
                        section.classList.remove('hidden-search');
                        section
                            .querySelectorAll('.menu-item')
                            .forEach((item) => item.classList.remove('hidden-search'));
                    } else {
                        section.classList.add('hidden-search');
                    }
                });

                footer?.classList.toggle('hidden', category !== 'all');
                document.getElementById('main-menu')?.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        /* ——— Promo Lunes–Miércoles ——— */
        function verificarYMostrarPromo() {
            const promoModal = document.getElementById('modal-promo-lunes-miercoles');
            if (!promoModal || !isPromoWindowActive()) return;
            promoModal.classList.add('active');
            lockBodyScroll(true);
        }

        document.getElementById('btn-close-promo')?.addEventListener('click', () => {
            document.getElementById('modal-promo-lunes-miercoles')?.classList.remove('active');
            lockBodyScroll(false);
        });

        /* ——— Referencias DOM principales ——— */
        const menu = document.getElementById('main-menu');
        const modal = document.getElementById('modal-hamburguesa');
        const closeModal = document.querySelector('.close-modal');
        const modalTitle = document.querySelector('.modal-title');
        const modalDesc = document.querySelector('.modal-description');
        const modalPrice = document.querySelector('.modal-price');
        const modalImg = document.getElementById('modal-img');
        const mainQtyVal = document.getElementById('main-qty-val');
        const extrasContainer = document.querySelector('.modal-extras-container');
        const cartBtn = document.getElementById('cart-floating-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCart = document.getElementById('close-cart');
        const cartBadge = document.getElementById('cart-badge');
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartGrandTotal = document.getElementById('cart-grand-total');
        const cartItemsView = document.getElementById('cart-items-view');
        const checkoutView = document.getElementById('checkout-view');
        const modalReminder = document.getElementById('modal-reminder');
        const btnReminderOk = document.getElementById('btn-reminder-ok');
        const btnNewOrder = document.getElementById('btn-new-order');
        const modalUpsellDrinks = document.getElementById('modal-upsell-drinks');
        const btnUpsellShowDrinks = document.getElementById('btn-upsell-show-drinks');
        const btnUpsellContinue = document.getElementById('btn-upsell-continue');
        const btnAddOrderMain = modal?.querySelector('.btn-add-order');
        const modalClosed = document.getElementById('modal-closed');
        const btnPreOrder = document.getElementById('btn-pre-order');

        const modalPromoSelection = document.getElementById('modal-promo-selection');
        const closePromoSelection = document.getElementById('close-promo-selection');
        const promoBurgerCards = document.querySelectorAll('#promo-burger-options .promo-burger-card');
        const promoComboCard = document.getElementById('promo-combo-option');
        const promoPriceDisplay = document.getElementById('promo-selection-price');
        const btnAddPromoToCart = document.getElementById('btn-add-promo-to-cart');

        const updatePromoUI = () => {
            if (!promoComboCard || !promoPriceDisplay) return;
            let total = CONFIG.PROMO_BASE_PRICE;
            const valSpan = promoComboCard.querySelector('.extra-qty-val');
            if (valSpan?.innerText === 'SÍ') total += CONFIG.PROMO_COMBO_EXTRA;
            promoPriceDisplay.innerHTML = `$${total.toFixed(2)} <span class="modal-ref">REF</span>`;
        };

        document.getElementById('btn-promo-ordenar')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('modal-promo-lunes-miercoles')?.classList.remove('active');
            const pModal = document.getElementById('modal-promo-selection');
            if (!pModal) return;
            pModal.classList.add('active');
            lockBodyScroll(true);
            const promoImg = document.getElementById('modal-promo-img');
            if (promoImg) promoImg.src = 'houseclasic.webp';
            updatePromoUI();
        });

        promoBurgerCards.forEach((card) => {
            card.onclick = () => {
                promoBurgerCards.forEach((c) => {
                    c.classList.remove('selected');
                    const span = c.querySelector('.extra-qty-val');
                    if (span) span.innerText = 'NO';
                });
                card.classList.add('selected');
                const val = card.querySelector('.extra-qty-val');
                if (val) val.innerText = 'SÍ';
                const mainImg = document.getElementById('modal-promo-img');
                if (mainImg && card.dataset.imgSrc) mainImg.src = card.dataset.imgSrc;
                updatePromoUI();
            };
        });

        promoComboCard?.addEventListener('click', () => {
            const valSpan = promoComboCard.querySelector('.extra-qty-val');
            if (!valSpan) return;
            const isSelected = valSpan.innerText === 'SÍ';
            valSpan.innerText = isSelected ? 'NO' : 'SÍ';
            promoComboCard.classList.toggle('selected', !isSelected);
            updatePromoUI();
        });

        closePromoSelection?.addEventListener('click', () => {
            modalPromoSelection?.classList.remove('active');
            lockBodyScroll(false);
            if (menu) menu.style.overflow = '';
        });

        btnAddPromoToCart?.addEventListener('click', () => {
            const selectedBurgerCard = Array.from(promoBurgerCards).find((c) =>
                c.classList.contains('selected')
            );
            if (!selectedBurgerCard) {
                alert('Por favor selecciona una hamburguesa.');
                return;
            }
            const burgerName = selectedBurgerCard.dataset.burger;
            const hasCombo = promoComboCard?.querySelector('.extra-qty-val')?.innerText === 'SÍ';
            const finalPrice = hasCombo ? CONFIG.PROMO_COMBO_PRICE : CONFIG.PROMO_BASE_PRICE;
            const extrasPromo = hasCombo
                ? [
                      {
                          nombre: 'Extra Papitas + Bombita',
                          qty: 1,
                          val: '1',
                          isToggle: false,
                          precio: CONFIG.PROMO_COMBO_EXTRA
                      }
                  ]
                : [];

            carrito.push({
                id: `promo-${Date.now()}`,
                nombre: `PROMO ${burgerName}`,
                cantidad: 1,
                precioUnitario: CONFIG.PROMO_BASE_PRICE,
                extras: extrasPromo,
                subtotal: finalPrice
            });
            actualizarInterfazCarrito();
            modalPromoSelection?.classList.remove('active');
            lockBodyScroll(false);
            if (menu) menu.style.overflow = '';
            abrirCarritoConFeedback();
        });

        let basePrice = 0;
        let currentMainQty = 1;
        let esHamburguesa = false;
        let esComboHouse = false;
        let esKids = false;
        let pedidoConfirmado = false;
        let currentDeliveryMethod = 'delivery';

        verificarHorario();

        const btnModeDelivery = document.getElementById('btn-mode-delivery');
        const btnModePickup = document.getElementById('btn-mode-pickup');
        const deliveryTools = document.getElementById('delivery-tools');
        const pickupInfo = document.getElementById('pickup-location-info');
        const deliveryNotice = document.querySelector('.delivery-notice-premium span');
        const additionalNotes = document.getElementById('additional-notes');

        const setDeliveryMethod = (method) => {
            currentDeliveryMethod = method;
            const taxCost = document.getElementById('tax-cost');
            const taxBar = document.getElementById('tax-bar-fill');
            const taxStatus = document.querySelector('.tax-status');

            if (method === 'delivery') {
                btnModeDelivery?.classList.add('active');
                btnModePickup?.classList.remove('active');
                deliveryTools?.classList.remove('hidden');
                pickupInfo?.classList.add('hidden');
                additionalNotes?.classList.remove('hidden');
                if (deliveryNotice) {
                    deliveryNotice.innerText =
                        'El costo del delivery varía según la zona de entrega';
                }
                if (window.deliveryDistance) {
                    window.deliveryCost = window.lastCalculatedCost;
                    const progress = Math.min(
                        (window.deliveryDistance / CONFIG.DELIVERY_MAX_KM) * 100,
                        100
                    );
                    if (taxBar) taxBar.style.width = `${progress}%`;
                    if (taxCost) taxCost.innerText = `DELIVERY: $${window.deliveryCost}`;
                    if (taxStatus) taxStatus.innerText = 'UBICACIÓN DETECTADA';
                } else {
                    window.deliveryCost = 0;
                    if (taxBar) taxBar.style.width = '0%';
                    if (taxCost) taxCost.innerText = 'DELIVERY: -- $';
                    if (taxStatus) taxStatus.innerText = 'Calculando al obtener ubicación...';
                }
            } else {
                btnModePickup?.classList.add('active');
                btnModeDelivery?.classList.remove('active');
                deliveryTools?.classList.add('hidden');
                pickupInfo?.classList.remove('hidden');
                additionalNotes?.classList.add('hidden');
                if (deliveryNotice) {
                    deliveryNotice.innerText = 'Retira tu pedido directamente en nuestra sede';
                }
                if (window.deliveryCost > 0) {
                    window.lastCalculatedCost = window.deliveryCost;
                }
                window.deliveryCost = 0;
                if (taxCost) taxCost.innerText = 'DELIVERY: GRATIS';
            }
            actualizarInterfazCarrito();
        };

        btnModeDelivery && (btnModeDelivery.onclick = () => setDeliveryMethod('delivery'));
        btnModePickup && (btnModePickup.onclick = () => setDeliveryMethod('pickup'));

        let carrito = [];
        try {
            carrito = JSON.parse(localStorage.getItem('bh_cart') || '[]');
            if (!Array.isArray(carrito)) carrito = [];
        } catch {
            carrito = [];
            localStorage.removeItem('bh_cart');
        }

        if (carrito.length > 0) actualizarInterfazCarrito();

        const cerrarFunc = () => {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal && activeModal.id !== 'modal-closed') {
                history.back();
            } else {
                modal?.classList.remove('active');
                modalReminder?.classList.remove('active');
                lockBodyScroll(false);
                if (menu) menu.style.overflow = '';
            }
        };

        function guardarCarrito() {
            try {
                localStorage.setItem('bh_cart', JSON.stringify(carrito));
            } catch (err) {
                console.warn('No se pudo guardar el carrito:', err);
            }
        }

        function abrirCarritoConFeedback() {
            checkoutView?.classList.add('hidden');
            cartItemsView?.classList.remove('hidden');
            setTimeout(() => {
                cartSidebar?.classList.remove('cart-closed');
                cartBtn?.classList.add('pulse-animation');
                setTimeout(() => cartBtn?.classList.remove('pulse-animation'), 1000);
            }, 300);
        }

        function actualizarInterfazCarrito() {
            if (!cartBadge || !cartItemsContainer || !cartGrandTotal) return;

            const totalItems = carrito.length;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
            cartBadge.innerText = String(totalItems);
            cartItemsContainer.innerHTML = '';

            let total = 0;
            if (carrito.length === 0) {
                checkoutView?.classList.add('hidden');
                cartItemsView?.classList.remove('hidden');
            }

            guardarCarrito();

            carrito.forEach((item) => {
                total += item.subtotal;
                const div = document.createElement('div');
                div.className = 'cart-item-row';

                const extrasHtml =
                    item.extras?.length > 0
                        ? item.extras
                              .map((e) => {
                                  const cleanName = e.nombre.replace(/^Extra\s+/i, '');
                                  if (e.isToggle && e.val === 'NO') return `SIN ${cleanName}`;
                                  return `+ Extra ${cleanName}${e.qty > 1 ? ` (${e.qty})` : ''}`;
                              })
                              .join(', ')
                        : item.nombre.startsWith('PROMO')
                          ? ''
                          : 'Sin adicionales';

                div.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.cantidad}x ${item.nombre}</h4>
                            <p class="cart-item-extras">${extrasHtml}</p>
                        </div>
                        <div class="cart-item-right">
                            <div class="cart-price-column">
                                <span class="cart-item-price">$${item.subtotal.toFixed(2)}</span>
                                <span class="cart-item-ref">REF</span>
                            </div>
                            <button class="remove-item" data-id="${item.id}" aria-label="Eliminar producto">&times;</button>
                        </div>
                    `;
                cartItemsContainer.appendChild(div);
            });

            cartItemsContainer.querySelectorAll('.remove-item').forEach((btn) => {
                btn.onclick = () => {
                    const idToRemove = btn.getAttribute('data-id');
                    carrito = carrito.filter((item) => item.id !== idToRemove);
                    actualizarInterfazCarrito();
                };
            });

            cartGrandTotal.innerHTML = `$${total.toFixed(2)} <span class="cart-ref-total">REF</span>`;
        }

        cartBtn?.addEventListener('click', () => {
            cartSidebar?.classList.remove('cart-closed');
            history.pushState({ ui: 'cart' }, '');
            lockBodyScroll(true);
            if (menu) menu.style.overflow = 'hidden';
        });

        closeCart?.addEventListener('click', () => {
            cartSidebar?.classList.add('cart-closed');
            lockBodyScroll(false);
            if (menu) menu.style.overflow = '';
            if (window.history.state?.ui === 'cart') history.back();
        });

        closeModal?.addEventListener('click', cerrarFunc);

        document.querySelectorAll('.menu-item').forEach((item) => {
            item.addEventListener('click', () => {
                const name = item.querySelector('.item-name')?.textContent.trim() ?? '';
                const desc = item.querySelector('.item-desc')?.textContent.trim() ?? '';
                const priceStr = item.querySelector('.item-price')?.innerText ?? '0';
                basePrice = parsePrice(priceStr);
                esKids = !!item.closest('#kids');
                const nameLower = name.toLowerCase();
                const esNuggets = nameLower.includes('nuggets');
                esComboHouse = nameLower.includes('combo house');
                esHamburguesa = !!item.closest('#hamburguesas') || esKids;

                const esBebida = !!item.closest('#bebidas');
                modal?.querySelector('.modal-content')?.classList.toggle('food-modal', !esBebida);

                const extrasGrid = document.querySelector('.extras-grid');
                if (!extrasGrid) return;

                const allCards = Array.from(extrasGrid.children);
                const descLower = desc.toLowerCase();
                const qtyContainer = modal?.querySelector('.modal-main-qty');
                if (qtyContainer) qtyContainer.style.display = esHamburguesa ? 'none' : 'block';

                if (modalTitle) modalTitle.innerText = name;
                if (modalDesc) modalDesc.innerText = desc;
                if (modalPrice) {
                    modalPrice.innerHTML = `$${basePrice.toFixed(2)} <span class="modal-ref">REF</span>`;
                }

                currentMainQty = 1;
                if (mainQtyVal) mainQtyVal.innerText = String(currentMainQty);

                const mainProteins = ['carne', 'pollo crispy', 'pollo', 'chuleta'];
                const mainProtFound =
                    mainProteins.find((p) => nameLower.includes(p) || descLower.includes(p)) || '';
                const recipeKeywords = [
                    'tocineta',
                    'queso',
                    'pepinillo',
                    'lechuga',
                    'salsa de la casa',
                    'huevito sorpresa'
                ];
                const toggles = allCards.filter((c) => c.dataset.isToggle === 'true');
                const costed = allCards.filter((c) => c.dataset.isToggle !== 'true');

                const sortedToggles = toggles
                    .map((card) => {
                        const cn = card.querySelector('.extra-name')?.textContent.toLowerCase().trim() ?? '';
                        let visible = false;
                        let rank = 1000;
                        const defaultValue = 'SÍ';

                        if (cn.includes('pan') && (esHamburguesa || esKids)) {
                            visible = true;
                            rank = 0;
                        } else if (mainProtFound && cn.includes(mainProtFound)) {
                            visible = true;
                            rank = 1;
                        } else if (
                            recipeKeywords.some((kw) => cn.includes(kw) && descLower.includes(kw))
                        ) {
                            visible = true;
                            const kwFound = recipeKeywords.find(
                                (kw) => cn.includes(kw) && descLower.includes(kw)
                            );
                            rank = 10 + descLower.indexOf(kwFound);
                        }
                        if (esKids && !['pan', 'carne', 'queso', 'huevito sorpresa'].includes(cn)) {
                            visible = false;
                        }
                        if (nameLower.includes('nuggets')) {
                            visible = ['salsa', 'ketchup', 'mostaza', 'mayonesa', 'queso'].some((kw) =>
                                cn.includes(kw)
                            );
                        }
                        const finalVisible =
                            (visible && esHamburguesa && !esComboHouse) ||
                            (visible && nameLower.includes('nuggets'));
                        card.style.display = finalVisible ? 'flex' : 'none';
                        card.dataset.rank = String(rank);
                        const valSpan = card.querySelector('.extra-qty-val');
                        if (valSpan) valSpan.innerText = defaultValue;
                        return card;
                    })
                    .sort((a, b) => parseInt(a.dataset.rank, 10) - parseInt(b.dataset.rank, 10));

                costed.forEach((card) => {
                    const cn = card.querySelector('.extra-name')?.textContent.toLowerCase().trim() ?? '';
                    let v = true;
                    if (esKids) v = cn.includes('huevito');
                    else if (nameLower.includes('nuggets')) {
                        v = ['salsa', 'ketchup', 'mostaza', 'mayonesa', 'queso'].some((kw) =>
                            cn.includes(kw)
                        );
                    } else if (esComboHouse) v = false;
                    card.style.display = v ? 'flex' : 'none';
                    const valSpan = card.querySelector('.extra-qty-val');
                    if (valSpan) valSpan.innerText = '0';
                });

                extrasGrid.innerHTML = '';
                sortedToggles.forEach((c) => extrasGrid.appendChild(c));
                costed.forEach((c) => extrasGrid.appendChild(c));

                if (extrasContainer) {
                    extrasContainer.style.display =
                        (esHamburguesa || nameLower.includes('nuggets')) && !esComboHouse
                            ? 'block'
                            : 'none';
                }

                updateTotal();

                const itemImageSrc = item.querySelector('.item-price-wrapper')?.dataset.imgSrc;
                if (modalImg) {
                    modalImg.src = itemImageSrc || 'hamburguesa.webp';
                    modalImg.classList.remove(
                        'modal-img-bottom-aligned',
                        'modal-img-junior-crispy-lower',
                        'modal-img-alejar'
                    );
                    const needsBottomAlignment =
                        esKids ||
                        name === 'Pork House' ||
                        name === 'Servicio de Papas con Topping' ||
                        esNuggets;
                    const needsNoZoom = name === 'Crispy House' || name === 'House Tower';
                    if (needsNoZoom) modalImg.classList.add('modal-img-alejar');
                    if (needsBottomAlignment) modalImg.classList.add('modal-img-bottom-aligned');
                    else if (name === 'Junior Crispy') {
                        modalImg.classList.add('modal-img-junior-crispy-lower');
                    }
                }

                modal?.classList.add('active');
                history.pushState({ ui: 'modal' }, '');
                lockBodyScroll(true);
                if (menu) menu.style.overflow = 'hidden';
            });
        });

        document.querySelectorAll('#modal-hamburguesa .extra-qty-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.extra-card');
                if (!card) return;
                const valSpan = btn.parentElement?.querySelector('.extra-qty-val');
                if (!valSpan) return;

                const isToggle = card.dataset.isToggle === 'true';
                const text = valSpan.innerText;
                let currentVal = text === 'SÍ' ? 1 : text === 'NO' ? 0 : parseInt(text, 10) || 0;

                if (btn.classList.contains('plus')) {
                    currentVal = isToggle ? 1 : currentVal + 1;
                } else if (btn.classList.contains('minus') && currentVal > 0) {
                    currentVal--;
                }

                valSpan.innerText = isToggle ? (currentVal === 1 ? 'SÍ' : 'NO') : String(currentVal);
                const nameText = card.querySelector('.extra-name')?.innerText ?? '';

                if (nameText === 'Pepinillos' && valSpan.innerText === 'NO') {
                    document
                        .querySelectorAll('.extra-card')
                        .forEach((c) => {
                            if (c.querySelector('.extra-name')?.innerText === 'Extra Pepinillos') {
                                const vs = c.querySelector('.extra-qty-val');
                                if (vs) vs.innerText = '0';
                            }
                        });
                }
                if (nameText === 'Extra Pepinillos' && currentVal > 0) {
                    document.querySelectorAll('.extra-card').forEach((c) => {
                        if (c.querySelector('.extra-name')?.innerText === 'Pepinillos') {
                            const vs = c.querySelector('.extra-qty-val');
                            if (vs) vs.innerText = 'SÍ';
                        }
                    });
                }
                updateTotal();
            });
        });

        document.getElementById('main-plus')?.addEventListener('click', () => {
            currentMainQty++;
            if (mainQtyVal) mainQtyVal.innerText = String(currentMainQty);
            updateTotal();
        });

        document.getElementById('main-minus')?.addEventListener('click', () => {
            if (currentMainQty > 1) currentMainQty--;
            if (mainQtyVal) mainQtyVal.innerText = String(currentMainQty);
            updateTotal();
        });

        const agregarAlPedido = () => {
            if (currentMainQty < 1 || !modal) return;

            const extrasSeleccionados = [];
            modal.querySelectorAll('.extra-card').forEach((card) => {
                if (card.style.display === 'none') return;
                const valText = card.querySelector('.extra-qty-val')?.innerText ?? '';
                const nombre = card.querySelector('.extra-name')?.innerText ?? '';
                const isToggle = card.dataset.isToggle === 'true';
                const qty =
                    valText === 'SÍ' ? 1 : valText === 'NO' ? 0 : parseInt(valText, 10) || 0;
                const incluir =
                    (!isToggle && qty > 0) || (isToggle && valText === 'NO');
                if (incluir) {
                    extrasSeleccionados.push({
                        nombre,
                        qty,
                        val: valText,
                        isToggle,
                        precio:
                            (parseFloat(
                                (card.dataset.extraPrice ?? '0').toString().replace(',', '.')
                            ) || 0) * qty
                    });
                }
            });

            const totalExtrasUnitarios = extrasSeleccionados.reduce((acc, e) => acc + e.precio, 0);
            const subtotalCalculado = (basePrice + totalExtrasUnitarios) * currentMainQty;

            carrito.push({
                id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
                nombre: modalTitle?.innerText ?? 'Producto',
                cantidad: currentMainQty,
                precioUnitario: basePrice,
                extras: extrasSeleccionados,
                subtotal: Number(subtotalCalculado.toFixed(2))
            });

            actualizarInterfazCarrito();
            currentMainQty = 1;
            if (mainQtyVal) mainQtyVal.innerText = '1';

            modal.querySelectorAll('.extra-card').forEach((card) => {
                const valSpan = card.querySelector('.extra-qty-val');
                if (!valSpan) return;
                if (card.dataset.isToggle === 'true') {
                    const nameLower = card.querySelector('.extra-name')?.innerText.toLowerCase() ?? '';
                    valSpan.innerText = nameLower.includes('extra') ? 'NO' : 'SÍ';
                } else {
                    valSpan.innerText = '0';
                }
            });

            cerrarFunc();

            if (esHamburguesa) {
                setTimeout(() => {
                    modalUpsellDrinks?.classList.add('active');
                    history.pushState({ ui: 'modal-upsell' }, '');
                    lockBodyScroll(true);
                    if (menu) menu.style.overflow = 'hidden';
                }, 400);
            } else {
                abrirCarritoConFeedback();
            }
        };

        btnAddOrderMain?.addEventListener('click', agregarAlPedido);

        document.getElementById('btn-go-checkout')?.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('Añade algo al carrito primero');
                return;
            }
            cartItemsView?.classList.add('hidden');
            checkoutView?.classList.remove('hidden');
        });

        document.getElementById('btn-back-to-cart')?.addEventListener('click', () => {
            checkoutView?.classList.add('hidden');
            cartItemsView?.classList.remove('hidden');
        });

        document.getElementById('form-delivery')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('full-name')?.value.trim() ?? '';
            const notas = document.getElementById('additional-notes')?.value.trim() ?? '';
            const mapsLink = document.getElementById('maps')?.value.trim() ?? '';

            if (!nombre) {
                alert('Por favor, ingresa tu nombre.');
                return;
            }

            let mensaje = '🍔 *NUEVO PEDIDO - BURGER HOUSE* 🍔\n\n';
            mensaje += `👤 *Cliente:* ${nombre}\n\n`;
            mensaje += '📝 *DETALLE DEL PEDIDO:*\n';

            let totalPedido = 0;
            carrito.forEach((item) => {
                const extras = item.extras || [];
                const sin = extras
                    .filter((ex) => ex.isToggle && ex.val === 'NO')
                    .map((ex) => ex.nombre.replace(/^Extra\s+/i, ''));
                const con = extras
                    .filter((ex) => !(ex.isToggle && ex.val === 'NO'))
                    .map(
                        (ex) =>
                            `${ex.nombre.replace(/^Extra\s+/i, '')}${ex.qty > 1 ? ` (${ex.qty})` : ''}`
                    );

                mensaje += `*${item.cantidad}x ${item.nombre}*\n`;
                if (con.length > 0) mensaje += `   + EXTRAS: ${con.join(', ')}\n`;
                if (sin.length > 0) mensaje += `   - QUITAR: ${sin.join(', ')}\n`;
                totalPedido += item.subtotal;
            });

            mensaje += '\n------------------------------\n';
            mensaje += `*TOTAL DEL PEDIDO: $${totalPedido.toFixed(2)} REF*\n`;
            mensaje += '_(El costo del delivery se calcula al recibir la ubicación)_\n';
            mensaje += '------------------------------\n\n';
            mensaje += '*DATOS DE ENTREGA:*\n';
            if (notas) mensaje += `*Notas/Referencia:* ${notas}\n`;
            if (mapsLink) mensaje += `*Ubicación Maps:* ${mapsLink}\n`;
            if (isPreOrder) mensaje += '\n\nPROCESAR AL ABRIR';

            const url = `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

            try {
                localStorage.removeItem('bh_cart');
            } catch {
                /* ignore */
            }

            pedidoConfirmado = true;
            history.pushState({ orderSent: true }, '');
            window.open(url, '_blank');
            cartSidebar?.classList.add('cart-closed');
            modalReminder?.classList.add('active');
        });

        const reloadAfterOrder = () => {
            pedidoConfirmado = false;
            currentMainQty = 1;
            if (mainQtyVal) mainQtyVal.innerText = '1';
            window.location.reload();
        };

        btnReminderOk?.addEventListener('click', reloadAfterOrder);
        btnNewOrder?.addEventListener('click', reloadAfterOrder);

        btnPreOrder?.addEventListener('click', () => {
            modalClosed?.classList.remove('active');
            lockBodyScroll(false);
            if (menu) menu.style.overflow = '';
        });

        function updateTotal() {
            if (!modal || !modalPrice) return;
            let extraTotal = 0;

            modal.querySelectorAll('.extra-card').forEach((card) => {
                if (card.style.display === 'none') return;
                const valText = card.querySelector('.extra-qty-val')?.innerText ?? '';
                const qty =
                    valText === 'SÍ' ? 1 : valText === 'NO' ? 0 : parseInt(valText, 10) || 0;
                const extraPriceValue =
                    parseFloat((card.dataset.extraPrice ?? '0').toString().replace(',', '.')) || 0;
                extraTotal += qty * extraPriceValue;
            });

            let finalTotal = (basePrice + extraTotal) * (currentMainQty || 1);
            if (Number.isNaN(finalTotal)) finalTotal = basePrice || 0;
            modalPrice.innerHTML = `$${finalTotal.toFixed(2)} <span class="modal-ref">REF</span>`;
            btnAddOrderMain?.classList.remove('btn-highlight');
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal || e.target === modalUpsellDrinks || e.target === modalPromoSelection) {
                cerrarFunc();
            }
        });

        btnUpsellShowDrinks?.addEventListener('click', () => {
            history.back();
            setTimeout(() => {
                document.querySelector('.category-btn[data-category="bebidas"]')?.click();
            }, 400);
        });

        btnUpsellContinue?.addEventListener('click', () => {
            history.back();
            setTimeout(abrirCarritoConFeedback, 400);
        });

        document.getElementById('form-delivery')?.reset();

        window.addEventListener('popstate', () => {
            if (pedidoConfirmado) {
                modalReminder?.classList.add('active');
                history.pushState({ orderSent: true }, '');
                return;
            }
            const activeModal = document.querySelector('.modal.active');
            const cartOpen = cartSidebar && !cartSidebar.classList.contains('cart-closed');
            if ((activeModal && activeModal.id !== 'modal-closed') || cartOpen) {
                activeModal?.classList.remove('active');
                cartSidebar?.classList.add('cart-closed');
                lockBodyScroll(false);
                if (menu) menu.style.overflow = '';
            }
        });

        window.addEventListener('beforeunload', (e) => {
            if (pedidoConfirmado) e.preventDefault();
        });

        /* ——— Geolocalización y taxímetro de delivery ——— */
        const btnLocation = document.getElementById('btn-get-location');
        const inputMaps = document.getElementById('maps');
        const textSpan = btnLocation?.querySelector('span');

        const actualizarTaximetro = (distancia, costo) => {
            const taxBar = document.getElementById('tax-bar-fill');
            const taxCost = document.getElementById('tax-cost');
            const taxStatus = document.querySelector('.tax-status');
            if (!taxBar || !taxCost) return;
            const progress = Math.min((distancia / CONFIG.DELIVERY_MAX_KM) * 100, 100);
            taxBar.style.width = `${progress}%`;
            taxCost.innerText = `DELIVERY: $${costo.toFixed(2)}`;
            if (taxStatus) taxStatus.innerText = 'UBICACIÓN DETECTADA';
        };

        if (btnLocation && inputMaps && textSpan) {
            btnLocation.addEventListener('click', () => {
                if (!navigator.geolocation) {
                    alert('Lo sentimos, tu navegador no soporta geolocalización.');
                    return;
                }

                const originalText = textSpan.innerText;
                textSpan.innerText = 'Buscando...';
                btnLocation.classList.add('loading');

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude: lat, longitude: lng } = position.coords;
                        const distancia = calcularDistanciaHaversine(
                            lat,
                            lng,
                            CONFIG.STORE_LAT,
                            CONFIG.STORE_LON
                        );
                        const costo = obtenerCostoDelivery(distancia);

                        window.deliveryDistance = distancia.toFixed(2);
                        window.deliveryCost = costo.toFixed(2);
                        actualizarTaximetro(distancia, costo);

                        inputMaps.value = `https://maps.google.com/?q=${lat},${lng}`;
                        inputMaps.classList.add('location-success');
                        setTimeout(() => inputMaps.classList.remove('location-success'), 2000);

                        textSpan.innerText = '¡Ubicado!';
                        btnLocation.classList.remove('loading');
                        setTimeout(() => {
                            textSpan.innerText = originalText;
                        }, 2000);
                    },
                    (error) => {
                        textSpan.innerText = originalText;
                        btnLocation.classList.remove('loading');
                        const mensajes = {
                            1: 'Por favor, permite el acceso a tu ubicación para facilitarnos la entrega.'
                        };
                        alert(mensajes[error.code] ?? 'No pudimos obtener tu ubicación.');
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            });
        }

        /* ——— Banner promocional: cerrar y ocultar al scroll ——— */
        const initPromoBanner = () => {
            const banner = document.getElementById('bh-promo-banner');
            const closeBtn = document.getElementById('bh-promo-banner-close');
            const menu = document.getElementById('main-menu');
            if (!banner || !menu) return;

            try {
                localStorage.removeItem('bh_banner_dismissed');
            } catch {
                /* ignore */
            }

            const revealBanner = () => {
                if (banner.classList.contains('is-dismissed')) return;
                banner.classList.remove('is-scroll-hidden');
            };

            if (sessionStorage.getItem('bh_banner_dismissed') === '1') {
                banner.classList.add('is-dismissed');
                return;
            }

            revealBanner();

            if (!menu.classList.contains('mostrar-menu')) {
                const menuObserver = new MutationObserver(() => {
                    if (menu.classList.contains('mostrar-menu')) {
                        revealBanner();
                        menuObserver.disconnect();
                    }
                });
                menuObserver.observe(menu, { attributes: true, attributeFilter: ['class'] });
            }

            let lastScrollTop = 0;
            const onScroll = () => {
                if (banner.classList.contains('is-dismissed')) return;
                const top = menu.scrollTop;
                if (top > 28 && top > lastScrollTop) {
                    banner.classList.add('is-scroll-hidden');
                } else if (top <= 12) {
                    revealBanner();
                }
                lastScrollTop = top;
            };

            menu.addEventListener('scroll', onScroll, { passive: true });

            closeBtn?.addEventListener('click', () => {
                banner.classList.add('is-dismissed');
                try {
                    sessionStorage.setItem('bh_banner_dismissed', '1');
                } catch {
                    /* ignore */
                }
            });
        };

        initPromoBanner();
    });
})();
