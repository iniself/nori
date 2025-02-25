class Scanner {
	constructor(options, args={}) {
		const {
			zoom = 2,
			videoConstraints = {},
			configOrVerbosityFlag = {},
			config = {}
		} = args;
		this.videoConstraints = {
			focusMode: "continuous",
			advanced: [{ zoom }],
			facingMode: "environment",
			...videoConstraints,
		}
		this.configOrVerbosityFlag = {
			experimentalFeatures: null,
			formatsToSupport: {},
			useBarCodeDetectorIfSupported: true,
			verbose: false,
			...configOrVerbosityFlag,
		};
		this.config = {
			fps: 5,
			qrbox: 200,
			useBarCodeDetectorIfSupported: true,
			rememberLastUsedCamera: true,
			aspectRatio: 4 / 3,
			showTorchButtonIfSupported: true,
			showZoomSliderIfSupported: true,
			defaultZoomValueIfSupported: zoom,
			videoConstraints: this.videoConstraints,
			...config,
		}

		this.dialog = null;
		this.handler = null;
		this.options = options;
		this.is_alive = false;
		this.onceFlag = false

		if (!("multiple" in this.options)) {
			this.options.multiple = false;
		}
		if (options.container) {
			this.$scan_area = $(options.container);
			this.scan_area_id = frappe.dom.set_unique_id(this.$scan_area);
		}
		if (options.dialog) {
			this.dialog = this.make_dialog();
			this.dialog.show();
		}
	}

	scan() {
		this.load_lib().then(() => this.start_scan());
	}

	start_scan() {
		if (!this.handler) {
			this.handler = new Html5Qrcode(this.scan_area_id); // eslint-disable-line
		}

		this.handler
			.start(
				{},
				this.config,
				(decodedText, decodedResult) => {
					if (this.options.on_scan) {
						try {
							this.options.on_scan(decodedResult);
						} catch (error) {
							frappe.show_alert(err, 5);
						}
					}
					if (!this.options.multiple) {
						this.stop_scan();
						this.hide_dialog();
					}
				},
				(errorMessage) => {
					// parse error, ignore it.
				}
			)
			.catch((err) => {
				this.is_alive = false;
				this.hide_dialog();
				frappe.show_alert(err, 5);
			});

		this.is_alive = true;
	}

	stop_scan() {
		if (this.handler && this.is_alive) {
			this.handler.stop().then(() => {
				this.is_alive = false;
				this.$scan_area.empty();
				this.hide_dialog();
			});
		}
	}

	make_dialog() {
		let _this = this
		let dialog = new frappe.ui.Dialog({
			title: __("Scan QRCode"),
			fields: [
				{
					fieldtype: "HTML",
					fieldname: "scan_area",
				},
			],
			primary_action_label: '<i class="fa fa-plus"></i>',
			primary_action(values) {
				// console.log(_this.handler.getRunningTrackCameraCapabilities().torchFeature().isSupported())
				_this.handler.applyVideoConstraints({
					advanced: [{ zoom: ++(_this.videoConstraints.advanced[0].zoom) }],
				});
			},
			secondary_action_label:'<i class="fa fa-minus"></i>',
			secondary_action(values) {
				if(--(_this.videoConstraints.advanced[0].zoom) < 1){
					_this.videoConstraints.advanced[0].zoom = 1
				}else{
					_this.videoConstraints.advanced[0].zoom
				}
				_this.handler.applyVideoConstraints({
					advanced: [{ zoom: --(_this.videoConstraints.advanced[0].zoom) < 1 ? _this.videoConstraints.advanced[0].zoom = 1 : _this.videoConstraints.advanced[0].zoom}],
				});            				
			},
			on_page_show: () => {
				this.$scan_area = dialog.get_field("scan_area").$wrapper;
				this.$scan_area.addClass("barcode-scanner");
				this.scan_area_id = frappe.dom.set_unique_id(this.$scan_area);
				this.scan();
			},
			on_hide: () => {
				this.stop_scan();
			},
		});
		dialog.add_custom_action('<i class="fa fa-bolt"></i>', function(){
			// console.log(_this.handler.getRenderedCameraOrFail().getFirstTrackOrFail().getConstraints())
			// console.log(_this.handler.getRenderedCameraOrFail().getFirstTrackOrFail().getSettings())
			if(!_this.handler.getRunningTrackCameraCapabilities().torchFeature().isSupported()){
				frappe.show_alert({
					message: "闪光灯打开失败，可尝试手动打开",
					indicator:'red'
				}, 5)
			}else{
				_this.handler.applyVideoConstraints({
					advanced: [{torch: true}],
				});				
			}
		})
		return dialog;
	}

	hide_dialog() {
		this.dialog && this.dialog.hide();
	}

	load_lib() {
		return frappe.require("/assets/frappe/node_modules/html5-qrcode/html5-qrcode.min.js");
	}
};

function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/android/.test(userAgent)) {
        return 'Android';
    } else if (/iphone|ipod/.test(userAgent)) {
        return 'iPhone';
    } else {
        return 'Other';
    }
}