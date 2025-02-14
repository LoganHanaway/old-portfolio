
(function ($) {

	$.fn.hover3d = function (options) {

		var settings = $.extend({
			selector: null,
			perspective: 1000,
			sensitivity: 20,
			invert: false,

			hoverInClass: "hover-in",
			hoverOutClass: "hover-out",
			hoverClass: "hover-3d"
		}, options);

		return this.each(function () {

			var $this = $(this),
				$card = $this.find(settings.selector);
			currentX = 0;
			currentY = 0;




			// Set perspective and transformStyle value
			// for element and 3d object
			$this.css({
				perspective: settings.perspective + "px",
				transformStyle: "preserve-3d"
			});

			$card.css({
				perspective: settings.perspective + "px",
				transformStyle: "preserve-3d",
			});



			// Mouse Enter function, this will add hover-in
			// Class so when mouse over it will add transition
			// based on hover-in class
			function enter(event) {
				$card.addClass(settings.hoverInClass + " " + settings.hoverClass);
				currentX = currentY = 0;
				setTimeout(function () {
					$card.removeClass(settings.hoverInClass);
				}, 1000);
			}

			// Mouse movement Parallax effect
			function move(event) {

				var w = $card.innerWidth(),
					h = $card.innerHeight(),
					currentX = Math.round(event.pageX - $card.offset().left),
					currentY = Math.round(event.pageY - $card.offset().top),
					ax = settings.invert ? (w / 2 - currentX) / settings.sensitivity : -(w / 2 - currentX) / settings.sensitivity,
					ay = settings.invert ? -(h / 2 - currentY) / settings.sensitivity : (h / 2 - currentY) / settings.sensitivity,
					dx = currentX - w / 2,
					dy = currentY - h / 2,
					theta = Math.atan2(dy, dx),
					angle = theta * 180 / Math.PI - 90;


				if (angle < 0) {
					angle = angle + 360;
				}


				$card.css({
					perspective: settings.perspective + "px",
					transformStyle: "preserve-3d",
					transform: "rotateY(" + ax + "deg) rotateX(" + ay + "deg)"
				});


			}

			// Mouse leave function, will set the transform
			// property to 0, and add transition class
			// for exit animation
			function leave() {
				$card.addClass(settings.hoverOutClass + " " + settings.hoverClass);
				$card.css({
					perspective: settings.perspective + "px",
					transformStyle: "preserve-3d",
					transform: "rotateX(0) rotateY(0)"
				});
				setTimeout(function () {
					$card.removeClass(settings.hoverOutClass + " " + settings.hoverClass);
					currentX = currentY = 0;
				}, 1000);
			}

			// Mouseenter event binding
			$this.on("mouseenter", function () {
				return enter();
			});

			// Mousemove event binding
			$this.on("mousemove", function (event) {
				return move(event);
			});

			// Mouseleave event binding
			$this.on("mouseleave", function () {
				return leave();
			});

		});

	};

}(jQuery));

$(".project").hover3d({
	selector: ".project__card"
});




