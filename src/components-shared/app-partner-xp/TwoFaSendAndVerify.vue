<template>
	<div class="two-fa-view-container">
		<two-fa-options
			v-if="currentView==views.VERIFICATION_OPTIONS"
			:email="email"
			:number="number"
			:country="country"
			:uitk-csrf-token="uitkCsrfToken"
			:next-view-key="views.VERIFY_ON_MOBILE"
			@message="onMessage"
			@viewChange="onViewChange"
		></two-fa-options>

		<two-fa-verify-mobile
			v-if="currentView==views.VERIFY_ON_MOBILE"
			:labels="JSON.stringify(labelsVerifyCode)"
			:email="email"
			:number="number"
			:country="country"
			:uitk-csrf-token="uitkCsrfToken"
			@message="onMessage"
			@success-validation="onVerifiedSuccess"
		></two-fa-verify-mobile>

		<two-fa-verify-email
			v-if="currentView==views.VERIFY_ON_EMAIL"
			:labels="JSON.stringify(labelsVerifyCode)"
			:email="email"
			:number="number"
			:country="country"
			:uitk-csrf-token="uitkCsrfToken"
			@message="onMessage"
			@success-validation="onVerifiedSuccess"
		></two-fa-verify-email>

	</div>
</template>


<script setup>
/**
 * NOTE:
 * Two ways to import web-components
 *      - Import
 *          `import "../../path-to-web-component/TwoFaOptions.js"`
 *      - Register on mounted (see onMounted below)
 *
 */
import {ref, onMounted} from 'vue';
import "./../../../public/components-shared/two-fa/TwoFaOptions.js"
import "./../../../public/components-shared/two-fa/TwoFaVerifyMobile.js"
import "./../../../public/components-shared/two-fa/TwoFaVerifyEmail.js"

const labelsVerifyCode = ref({});

const props = defineProps({
	email: {
		type: String,
		default: ''
	},
	number: {
		type: String,
		default: ''
	},
	country: {
		type: String,
		default: ''
	},
	uitkCsrfToken: String,
})

const viewOptions = {
	VERIFICATION_OPTIONS: 'verificationOptions',
	VERIFY_ON_MOBILE: 'phoneVerifyConfirm',
	VERIFY_ON_EMAIL: 'verifyCodeEmail',
	FRAUD: 'signUpFraud'
}
const views = ref(viewOptions);
const currentView = ref(viewOptions.VERIFICATION_OPTIONS);

function onMessage(e){
	const {status, message} = e.detail || {};
	if(currentView.value == viewOptions.VERIFICATION_OPTIONS){
		console.log({status, message})
		if(status === "success"){
			labelsVerifyCode.value = {
				description: message
			}
		}else if(status === "error"){
				// Notification error
		}
	}

}

function onViewChange(e) {
	currentView.value = e.detail;
}

function onVerifiedSuccess(e) {
	console.log(e);
	alert("Code verified")
}


onMounted(() => {
	// Ensure the custom element is registered if the script wasn't loaded globally
	if (!customElements.get('two-fa-options')) {
		const scriptId = 'two-fa-options-script';
		if (!document.getElementById(scriptId)) {
			const script = document.createElement('script');
			script.id = scriptId;
			script.src = '/components-shared/two-fa/TwoFaOptions.js';
			document.head.appendChild(script);
		}
	}


});
</script>

<style lang="less" scoped>

</style>