class Scanner {
	constructor(options, args = {}) {
		const {
			zoom = 2.0,
			videoConstraints = {},
			configOrVerbosityFlag = {},
			config = {}
		} = args;
		this.videoConstraints = {
			focusMode: "continuous",
			advanced: [{ zoom }],
			// facingMode: "environment",
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
			aspectRatio: 4 / 3,
			videoConstraints: this.videoConstraints,
			...config,
		}

		this.dialog = null;
		this.handler = null;
		this.options = options;
		this.is_alive = false;
		this.onceFlag = false;

		this.devices = [];
		this.change_device_number = 0
		this.preferredCameraDeviceId = ""

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
		let _this = this
		this.load_lib().then(function(){
			Html5Qrcode.getCameras().then(devices => {
				console.log(devices)
				if(!devices.length){
					frappe.show_alert({
						message: "没有发现摄像头",
						indicator: 'red'
					}, 5)
					_this.hide_dialog()
					return
				}
				_this.devices = devices
				if(_this.preferredCameraDeviceId){
					_this.change_device_number = devices.findIndex(item => item.id === _this.preferredCameraDeviceId);
					if(_this.change_device_number==-1){
						_this.change_device_number = 0
					}
				}
				_this.start_scan()
			})
		});
	}

	start_scan() {
		if (!this.handler) {
			this.handler = new Html5Qrcode(this.scan_area_id); // eslint-disable-line
		}
		this.videoConstraints.deviceId = this.devices[(this.change_device_number)%(this.devices.length)].id;
		localStorage.setItem("preferredCameraDeviceId", this.videoConstraints.deviceId);
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

	change_device(){
		let _this = this
		++this.change_device_number
		if (this.handler && this.is_alive) {
			this.handler.stop().then(() => {
				_this.start_scan()
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
				if(!_this.handler.getRunningTrackCameraCapabilities().zoomFeature().isSupported()){
					frappe.show_alert({
						message: "不支持该操作",
						indicator: 'red'
					}, 5)
				}else{
					let zoom = ++(_this.videoConstraints.advanced[0].zoom)
					_this.handler.applyVideoConstraints({
						advanced: [{ zoom: zoom }],
					}).then(()=>localStorage.setItem("preferredZoom", zoom));
				}
			},
			secondary_action_label: '<i class="fa fa-minus"></i>',
			secondary_action(values) {
				if(!_this.handler.getRunningTrackCameraCapabilities().zoomFeature().isSupported()){
					frappe.show_alert({
						message: "不支持该操作",
						indicator: 'red'
					}, 5)
				}else{
					let zoom = --(_this.videoConstraints.advanced[0].zoom) < 1 ? _this.videoConstraints.advanced[0].zoom = 1 : _this.videoConstraints.advanced[0].zoom
					_this.handler.applyVideoConstraints({
						advanced: [{ zoom: zoom }],
					}).then(()=>localStorage.setItem("preferredZoom", zoom));
				}				
			},
			on_page_show: () => {
				this.$scan_area = dialog.get_field("scan_area").$wrapper;
				this.$scan_area.addClass("barcode-scanner");
				this.scan_area_id = frappe.dom.set_unique_id(this.$scan_area);
				if(localStorage.getItem("preferredCameraDeviceId")){
					this.preferredCameraDeviceId = localStorage.getItem("preferredCameraDeviceId")
				}
				if(localStorage.getItem("preferredZoom")){
					this.videoConstraints.advanced[0].zoom = localStorage.getItem("preferredZoom")
				}
				this.scan();
			},
			on_hide: () => {
				this.stop_scan();
			},
		});
		dialog.add_custom_action('<i class="fa fa-bolt"></i>', function () {
			if (!_this.handler.getRunningTrackCameraCapabilities().torchFeature().isSupported()) {
				frappe.show_alert({
					message: "闪光灯打开失败，可尝试手动打开",
					indicator: 'red'
				}, 5)
			} else {
				_this.handler.applyVideoConstraints({
					advanced: [{ torch: true }],
				});
			}
		}, "mr-2")

		dialog.add_custom_action('<i class="fa fa-camera"></i>', function () {
			_this.change_device()
		}, "mr-3")
		
		let change = dialog.custom_actions.find(".fa-camera").parent()
		let primary_btn = dialog.get_primary_btn()
		let second_btn = dialog.get_secondary_btn()
		change.prop("disabled", "true")
		primary_btn.prop("disabled", "true")
		second_btn.prop("disabled", "true")
		
		dialog.add_custom_action('<i class="fa fa-lock"></i>', function (t) {
			let i = $(this).find(".fa")
			if(i.hasClass('fa-lock')){
				i.removeClass('fa-lock').addClass('fa-unlock')
			}else{
				i.removeClass('fa-unlock').addClass('fa-lock')
			}
			change.prop("disabled", !change.prop("disabled"))
			primary_btn.prop("disabled", !primary_btn.prop("disabled"))
			second_btn.prop("disabled", !second_btn.prop("disabled"))
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