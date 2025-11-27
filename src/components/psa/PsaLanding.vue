

<template>
  <LoadingDots v-if="masked" style="z-index: 9999"/>
  <div id="mask" v-if="masked" style="background-color: white;opacity: 70%;position: fixed;inset:0;">
  </div>


  <div id="psa-container">

    <!--    Confirmation modal -->
    <Modal ref="confpop" :title="confirmationContext" preventClose :autoHeight="true" width="450px" :is-open="modalOpen" @close="modalOpen=false" class="psa-confirmation">
      <template #content>
          <div class="modal-content">
            <img src="../../assets/images/warning.svg" alt="warning" />
            <h1>{{getMessage('psa_landing_view.step1.modal.heading')}}</h1>
            <p v-html="getMessage('psa_landing_view.step1.modal.p1', {label: 'psa_landing_view.step1.agreement_name', url:termsUrl})"></p>
            <p>{{getMessage('psa_landing_view.step1.modal.p2')}}</p>
          </div>
      </template>
      <template #footer>
          <div class="modal-footer">
            <btn class="primary-red" @click="doDeclineTerms">{{getMessage('psa_landing_view.step1.modal.decline')}}</btn>
            <btn class="secondary" @click="modalOpen=false">{{getMessage('psa_landing_view.step1.modal.cancel')}}</btn>
          </div>
      </template>
    </Modal>
    <div id="psa-landing">
      <!--    first page -->
    <div v-if="step1" id="psa-landing-inner">
      <div class="psa-landing-header">
        <img src="../../assets/images/impact-logo.svg" id="logo" alt="impact.com logo"/>
        <h1 class="title">{{getMessage('psa_landing_view.step1.header.title')}}</h1>
        <p class="description" v-html="getMessage('psa_landing_view.step1.header.description')"></p>
      </div>
      <div class="psa-landing-body bordered">
        <section>
          <h2>{{getMessage('psa_landing_view.step1.section1.heading')}}</h2>
          <p v-html="getMessage('psa_landing_view.step1.section1.description', {label:'psa_landing_view.step1.agreement_name', url: termsUrl}, {label:'psa_landing_view.step1.models_text', url:modelUrl})"></p>
        </section>
        <section>
          <h2>{{getMessage('psa_landing_view.step1.section2.heading')}}</h2>
          <p>{{getMessage('psa_landing_view.step1.section2.description')}}</p>
        </section>
        <section>
          <h2>{{getMessage('psa_landing_view.step1.section3.heading')}}</h2>
          <p v-html="getMessage('psa_landing_view.step1.section3.description.p1', {label:'psa_landing_view.step1.agreement_name', url: termsUrl})"></p>
          <p>{{getMessage('psa_landing_view.step1.section3.description.p2')}}</p>
          <p>{{getMessage('psa_landing_view.step1.section3.description.p3')}}</p>
        </section>
        <section>
          <p v-html="getMessage('psa_landing_view.step1.section3.description.p4', {label:'psa_landing_view.step1.contact_text',url:contactUrl})"></p>
        </section>
      </div>
      <div class="psa-landing-footer">
        <p class="terms-message">
          {{getMessage('psa_landing_view.step1.footer.terms')}}
        </p>
        <div class="cta">
          <btn class="cta-btn primary" @click="doAcceptTerms">{{getMessage('psa_landing_view.step1.footer.accept')}}</btn>
          <btn class="cta-btn secondary" @click="modalOpen=true">{{getMessage('psa_landing_view.step1.footer.decline')}}</btn>
        </div>
      </div>
    </div>
    <div v-else id="psa-landing-inner">
      <!--    second page shown after modal  -->
      <div class="psa-landing-header">
        <img src="../../assets/images/impact-logo.svg" id="logo" alt="impact.com logo" />
        <h1 class="title">{{getMessage('psa_landing_view.step2.header.title')}}</h1>
        <p class="description">{{getMessage('psa_landing_view.step2.header.description')}}</p>
      </div>
      <div class="psa-landing-body bordered">
        <section>
          <h2>{{getMessage('psa_landing_view.step2.section1.heading')}}</h2>
          <p>{{getMessage('psa_landing_view.step2.section2.description')}}</p>
        </section>
        <section>
          <h2>{{getMessage('psa_landing_view.step2.section2.heading')}}</h2>
          <p>{{getMessage('psa_landing_view.step2.section2.description')}}</p>
        </section>
      </div>
      <div class="psa-landing-footer bordered signIn">
          <template v-if="accountOptions.length">
            <h2>{{getMessage('psa_landing_view.step2.section3.heading')}}</h2>
            <multi-select-input v-model="accountValue" :items="accountOptions" is-single-select class="full-width" closeOnSelect />
            <btn class="secondary full-width" @click="switchAccount">{{getMessage('psa_landing_view.step2.section3.signin')}}</btn>
          </template>
          <template v-else>
            <btn class="secondary full-width" @click="logOut">{{getMessage('psa_landing_view.step2.section3.signout')}}</btn>
          </template>

      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { Btn, Modal, MultiSelectInput, LoadingDots } from "@impactinc/ui-component-library";

export default {
  name: "PsaLanding",
  components: {
    Btn,
    Modal,
    MultiSelectInput,
    LoadingDots
  },
  props: {
    csrf: String,
  },
  data() {
    return {
      step1: true,
      modalOpen: false,
      messages: {},
      accountOptions: [],
      accountValue: '',
      masked: true,
      termsUrl: 'https://impact.com/legal/Partner-services-agmt-0525.pdf',
      modelUrl: 'https://help.impact.com/en/support/solutions/articles/155000005773-understanding-impact-com-s-trading-models',
      contactUrl: '/support/support-landing.ihtml',
      messageKeys: [
        'psa_landing_view.step1.agreement_name',
        'psa_landing_view.step1.models_text',
        'psa_landing_view.step1.contact_text',

        'psa_landing_view.step1.header.title',
        'psa_landing_view.step1.header.description',
        'psa_landing_view.step1.section1.heading',
        'psa_landing_view.step1.section1.description',
        'psa_landing_view.step1.section2.heading',
        'psa_landing_view.step1.section2.description',
        'psa_landing_view.step1.section3.heading',
        'psa_landing_view.step1.section3.description.p1',
        'psa_landing_view.step1.section3.description.p2',
        'psa_landing_view.step1.section3.description.p3',
        'psa_landing_view.step1.section3.description.p4',
        'psa_landing_view.step1.footer.terms',
        'psa_landing_view.step1.footer.accept',
        'psa_landing_view.step1.footer.decline',
        'psa_landing_view.step1.modal.heading',
        'psa_landing_view.step1.modal.p1',
        'psa_landing_view.step1.modal.p2',
        'psa_landing_view.step1.modal.decline',
        'psa_landing_view.step1.modal.cancel',

        'psa_landing_view.step2.contact_text',
        'psa_landing_view.step2.header.title',
        'psa_landing_view.step2.header.description',
        'psa_landing_view.step2.section1.heading',
        'psa_landing_view.step2.section1.description',
        'psa_landing_view.step2.section2.heading',
        'psa_landing_view.step2.section2.description',
        'psa_landing_view.step2.section3.heading',
        'psa_landing_view.step2.section3.signin',
        'psa_landing_view.step2.section3.signout'
        ],
    };
  },
  methods: {
    getMessage(args) {
      let msg = this.messages[arguments[0]];
      if(msg) {
        // console.log(msg, arguments[0], this.messages);
        const argsCopy = Array.from(arguments);
        argsCopy.shift();

        for (const index of argsCopy.keys()) {
          let text = this.messages[argsCopy[index].label]
          if(argsCopy[index].url) {
            text = '<a href="' + argsCopy[index].url + '" target="_blank" class="linked">' + text + '</a>';
          }
          msg = msg.replace(`{${index}}`, text);
        }
        return msg;
      }
      return arguments[0] || '...';
    },
    doAcceptTerms() {
      this.masked = true;
      fetch("/secure/mediapartner/nositemesh/psa/accept.json",
        {
          method: 'POST',
          headers: {
            "uitk_csrf": this.csrf
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(data.error) {
            console.error(data.message);
          }
          else {
            window.location = data;
          }
        })
        .catch(error => console.error(error))
    },
    doDeclineTerms() {
      fetch("/secure/mediapartner/nositemesh/psa/decline.json",
        {
          method: 'POST',
          headers: {
            "uitk_csrf": this.csrf
          },
        })
        .then((response) => response.json())
        .then((data) => {
          if(data.error) {
            console.error(data.error);
          }
          else {
            this.step1=false;
            this.modalOpen=false;
            this.accountValue = data[0];
            this.accountOptions = data;
          }
        })
        .catch(error => console.error(error))
    },
    logOut() {
      window.location = '/logOut.user';
    },
    switchAccount() {
      const accountId = this.accountValue;
      const accountItem =  this.accountOptions.find((item) => item.value === accountId);

      fetch('/secure/nositemesh/getUsershipSwitchURL.ihtml?id='+Number(accountItem.value)+'&usershipId='+accountItem.metaData.usershipId+'&accountType='+accountItem.metaData.accountType)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Request failed. Status:", response.status);
            }
          })
          .then(data => {
            window.location.href = data;
          })
          .catch(error => {
            console.warn("Cannot Switch to this Account, please choose another", error);
            document.getElementById("cannotSwitch").textContent = 'Cannot Switch to this Account, plese choose another'
          });
    }
  },
  computed: {
  },
  beforeMount() {
    fetch("/secure/nositemesh/langtranslation/getTranslations.ihtml?messageKeys=" + this.messageKeys.join(','))
      .then((response) => response.json())
      .then((data) => {
        this.messages = data;
        this.masked = false;
      })
      .catch(error => console.log(error))
  },

};
</script>

<style lang="less" scoped>
a.linked {
  color: var(--color-text-text-interactive, #14B1F7);
}
#psa-container {

  .psa-confirmation {
    background: red;
  }
}
#psa-landing {

  color: var(--color-text-text-default, #2D3E50);
  font-family: var(--typography-font-family-font-family, Mulish);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-padding-nav-item-tertiary-padding-left, 45px) 121px;


  #psa-landing-inner {

    width: 40%;
    min-width: 458px;

    .psa-landing-header {
      text-align: center;
      #logo {
        width: 100px;
        height: 32px;
        flex: 1;
      }

      .title {
        font-size: var(--font-size-header, 24px);
        font-style: normal;
        font-weight: 700;
        line-height: var(--line-height-header, 33px);
        text-transform: capitalize;
        padding-top: var(--space-gap-gap-default, 10px);
        padding-bottom: var(--space-gap-gap-default, 10px);
      }
      .description {
        font-size: var(--font-size-description-text, 14px);
        line-height: var(--line-height-description-text, 18px);
        color: var(--color-text-text-subdued, #6C7784);
      }

    }
    .bordered {
      border:var(--iui-border-default);
      border-radius:var(--iui-border-radius-default);
      padding: var(--space-gap-gap-large, 20px);
    }

    .psa-landing-body {
      margin-top: var(--space-gap-gap-large, 20px);
      margin-bottom: var(--space-gap-gap-large, 20px);


      section {
        padding-bottom: var(--space-gap-gap-default, 10px);
        h2 {
          font-size: var(--font-size-field-label, 16px);
          line-height: var(--line-height-field-label, 20px);
          margin-bottom: 5px;
        }
        p {
          font-size: var(--font-size-regular-text, 14px);
          line-height: var(--line-height-regular-text, 18px);
        }
        &:last-of-type {
          padding-bottom: 0;
        }
      }

    }

    .psa-landing-footer {
      .terms-message {
        color: var(--color-text-text-subdued, #6C7784);
        font-size: var(--font-size-help-text, 12px);
        line-height: var(--line-height-help-text, 15px);
        padding-bottom: var(--space-gap-gap-default, 10px);
      }
      .cta {
        display: flex;
        gap: var(--space-gap-gap-default, 10px);
        .cta-btn {
          flex-grow: 2;

          height: var(--space-height-button-height-default, 38px);
          min-width: 65px;
          padding: 0 var(--space-padding-button-padding-leftright-default, 10px);
        }
      }

      &.signIn {
          h2 {
            margin-bottom: var(--space-gap-gap-default, 10px);
          }
          .secondary {
            margin-top: var(--space-gap-gap-default, 10px);
          }
      }
    }
  }
}


  .modal-content {
    text-align: center;
    color: var(--color-text-text-default, #2D3E50);
    h1 {
      font-size: var(--font-size-subheader, 18px);
      font-weight: 600;
      line-height: var(--line-height-subheader, 23px);
      margin: var(--space-gap-gap-default, 10px) 0;
    }
    p {
      font-size: var(--font-size-regular-text, 14px);
      line-height: var(--line-height-regular-text, 18px);
      margin-bottom: var(--space-gap-gap-default, 10px);
    }
    a.linked {
      color: var(--color-text-text-interactive, #14B1F7);
    }
  }
  .modal-footer {
    display: flex;
    gap: var(--space-gap-gap-default, 10px);
    margin-right: 20px;
    button {
      height: 38px;
      flex: 1;
    }
    button.iui-btn.primary-red {
      background-color: var(--color-critical-text-critical-subdued, #C00800);
      color: #fff;
    }
  }
</style>