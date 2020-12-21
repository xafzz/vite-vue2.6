const app = getApp();
const servsers = getApp().globalData.servsers;
const wssServsers = getApp().globalData.wssServsers;
const oldServsers = getApp().globalData.oldServsers;
const Request = require('../../utils/request.js');
import { WebSocket } from '../../utils/WebSocket';
import { getUrlParam, getFirstRoute, errorLog, buryingPoint, fixDialogType, formatDate } from '../../utils/util.js';
const userHelpStoreIds = [187558199999, '187558199999', 589251317996, '589251317996', 1490866541301, '1490866541301'];
let doctorList = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isIpx: false,
    scrollTop: 0, // 当前滚动的距离
    imgUrls: [],
    navList: [],
    otherWayEnter: false, // 是否弹出提示请扫码进入
    isLogin: false, // 是否授权登录
    isMemberFlag: false, // 是否注册会员
    showRegister: false,
    hidden: true, // loading
    typeModal: false, // 选择问诊类型弹窗
    storeAndBusinessInfo: null, // 门店 连锁信息
    isShowAccount: true, // 是否展示引导关注公众号组件
    isShowAddToMy: true, // 引导收藏小程序 
    detailModal: false,
    dialogButtons: [{ text: '挂断' }, { text: '开始问诊' }],
    dialogShow: false,
    dialogTitle: '排队到号通知',
    dialogContent: '您发起的问诊已到号，请点击【开始问诊】按钮与医生对话',
    doctorinfo: null, // 点击立即问诊的医生信息
    selectDocId: '', // 选择或分配的医生id
    isShowGaojiModal: false, // 是否弹高济授权弹窗
    gaojiInfoChecked: false, // 是否接受 服务协议授权
    gaoJiOpt: {},
    dialogType: '1', // 问诊方式 '1'视频问诊 '2'图文问诊
    interrogationType: '1', // 0开方拿药 1病症咨询
    laboratoryId: 0, // 科室id  默认是全部科室
    doctorDataList: [], // 当前科室的医生
    scrollLeft: 0,
    freeDoctor: false, // 当前问诊医生是否是义诊医生
    shareConfig: {}, // 分享数据
    shareId: '', // 分享配置的id
    shareImg: '',
    laboratoryList: [],
    homeVideoFlag:true, //区分首页点击视频问诊还是立即问诊
  },

  onLoad: function (option) { 
    buryingPoint({ action: 'home' });
    let accessToken = wx.getStorageSync('access_token') ? wx.getStorageSync('access_token') : '';
    let isMemberFlag = wx.getStorageSync('isMemberFlag') ? wx.getStorageSync('isMemberFlag') : false;
    // 如果授权过 并且是会员 开启全局ws
    if (!!accessToken && isMemberFlag) {
      app.beginWs();
    }
    let sceneArr = option.scene ? option.scene.split('_') : [''];
    let optionStoreId = sceneArr.length > 1 ? sceneArr[1] : sceneArr[0];
    console.log('home option', option, sceneArr);
    // 分享进入埋点
    if (sceneArr.length > 1) {
      this.shareInPoint(sceneArr[0])
    }
    if (optionStoreId == '') {
      let storeinfo =  wx.getStorageSync('storeAndBusinessInfo');
      if (storeinfo) {
        optionStoreId = storeinfo.storeId
      }
    }
    if (option.fromType == 1 || option.fromType == 2) {
      // fromType 为2代表从高济健康小程序跳转过来 为1 代表从高济健康app跳转过来 需要先判断是否弹授权弹窗
      if (option.phone && option.businessUserId && option.phone != 'undefined' && option.businessUserId != 'undefined') {
        app.globalData.phone = option.phone;
        app.globalData.businessUserId = option.businessUserId;
        this.isFromGaoJi(option);
      } else {
        this.getStoreInfo(optionStoreId);
      }
    } else {
      // 根据路径中的门店id 或者 缓存中的门店id 获取详细的连锁、门店信息
      this.getStoreInfo(optionStoreId);
    }
  },

  onShow: function (option) {
    // app.getUpdate();
    const that = this;
    let isShowAddToMy = true;
    // 是否由收藏进入过
    let enteredByMy = wx.getStorageSync('enteredByMy') ? wx.getStorageSync('enteredByMy') : false;
    if (enteredByMy) {
      isShowAddToMy = false;
    } else {
      isShowAddToMy = true;
    }
    if (app.globalData.enterScene === 1089) {
      wx.setStorageSync('enteredByMy', true);
      isShowAddToMy = false;
    }
    this.attached();
    if (this.data.storeAndBusinessInfo && this.data.storeAndBusinessInfo.businessId) {
      this.getDoctorList();
      this.connetWS();
    }
    let accessToken = wx.getStorageSync('access_token') ? wx.getStorageSync('access_token') : '';
    let isMemberFlag = wx.getStorageSync('isMemberFlag') ? wx.getStorageSync('isMemberFlag') : false;
    if (!!accessToken) {
      let tokenInfo = wx.getStorageSync('tokenInfo') || {};
      this.setData({
        isLogin: true,
        isMemberFlag: isMemberFlag,
        userId: tokenInfo.userId,
        hidden: true,
        isShowAccount: app.globalData.isShowAccount,
        isShowAddToMy,
      }, () => {
        if (isMemberFlag) {
          that.getAccountStatus();
          that.checkOrderNew();
        }
      });
    } else {
      this.setData({
        isLogin: false,
        isMemberFlag: isMemberFlag,
        hidden: true,
        isShowAccount: app.globalData.isShowAccount,
        isShowAddToMy,
      });
    }
    // 2020-12-04 白金得确认
    // 功能废弃，直接从注册成功跳转到添加药品=>添加就诊人
    // const homeJoin = wx.getStorageSync('homeJoin');
    // if(   homeJoin===1   ) {
    //   this.inquiryDoctor(2)
    //   wx.removeStorageSync('homeJoin');
    // }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    wx.removeStorageSync('selectedPatientIndex')
    wx.removeStorageSync('selectedDrugs')
    if (app.globalData.doctorListWS) {
      app.globalData.doctorListWS.close();
    }
  },

  //刷新处理
  onPullDownRefresh: function (e) {
    const that = this;
    if (that.data.otherWayEnter) {
      wx.stopPullDownRefresh();
      return;
    }
    this.getBannerInfo();
  },

  onShareAppMessage() {
    const storeAndBusinessInfo = wx.getStorageSync('storeAndBusinessInfo') || {};
    const { shareConfig, storeId, shareImg } = this.data;
    const tokenInfo = wx.getStorageSync('tokenInfo') ? wx.getStorageSync('tokenInfo') : {};
    const resolveRemark = (mark) => {
      let newMarkStr = mark;
      const getReg = (name) => new RegExp(`{${name}}`, 'g');

      const regAppName = getReg('小程序名称');
      if (regAppName.test(newMarkStr)) {
        newMarkStr = newMarkStr.replace(regAppName, '高济互联网医院');
      }

      const regUserName = getReg('分享用户姓名');
      if (regUserName.test(newMarkStr)) {
        newMarkStr = newMarkStr.replace(regUserName, tokenInfo.name || '');
      }

      console.log('newMarkStr', newMarkStr);

      return newMarkStr;
    }
    return {
      title: resolveRemark(shareConfig.remark),
      path: `${shareConfig.skipUrl}?scene=${storeAndBusinessInfo.storeId}`,
      imageUrl: `${shareImg || ''}`
    }
  },

  // 分享进入埋点
  shareInPoint(shareId) {
    Request.request({
      url: oldServsers + '/wxgateway/api/shareCommon/saveShareEvent',
      method: 'POST',
      data: {
        eventType: 1,
        shareId,
      },
      success: ({ result }) => {
        console.log('首页分享进入埋点成功', result);
      },
      noSuccess: () => {

      }
    });
  },

  // 获取分享配置
  getShareConfig() {
    const storeAndBusinessInfo = wx.getStorageSync('storeAndBusinessInfo') || {};
    Request.request({
      url: oldServsers + '/fund/api/noauth/shareConfig/findAppConfigByOutIdV2',
      method: 'POST',
      data: {
        outId: 100024, // 分享的页面编码
        pageSerialNo: 100024, // 分享的页面编码
        businessId: storeAndBusinessInfo.businessId,
        contextParam: { },
      },
      success: ({ result }) => {
        console.log('首页分享数据', result);
        this.setData({
          shareConfig: result.floorConfig,
          shareId: result.id,
        })
      },
      noSuccess: function () {

      }
    });
  },

  // 检查当前时间是否有预约单
  checkOrderNew() {
    let tokenInfo = wx.getStorageSync('tokenInfo') || {};
    Request.request({
      url: oldServsers + '/order/api/order/remind',
      method: "POST",
      data: {},
      success: (res) => {
        let resultData = res.result;
        console.log('检查当前时间内是否有预约单', res, resultData);
        if (resultData) {
          wx.showModal({
            title: '温馨提示',
            content: `您有一个预约问诊，就诊人：${resultData.patientName},就诊时间${resultData.expectDate}${resultData.expectTime}，请准时就诊`,
            cancelText: '取消',
            confirmText: '立即问诊',
            success: (res) => {
              console.log('立即问诊');
              if (res.confirm) {
                wx.navigateTo({
                  url: `../interrogationForm/interrogationForm?doctorId=${resultData.doctorId}&orderId=${resultData.orderId}`,
                });
              }
            }
          });
        }
        // let dateStr = formatDate(new Date(), 'YYYY年MM月DD日');
        // if (resultData && resultData.orderIdStr) {
        //   this.checkOrderStatus(resultData);
        // }
      },
      noSuccess: (res) => {
        this.setData({
          hidden: true,
        });
      },
    });
  },

  // 检查当前时间内是否有预约单
  checkOrder() {
    console.log('checkorder')
    let tokenInfo = wx.getStorageSync('tokenInfo') || {};
    Request.request({
      url: servsers + '/his/api/reserveUser/queryReserveUserInfo',
      method: "GET",
      data: {
        userId: tokenInfo.userId
      },
      success: (res) => {
        let resultData = res.result;
        console.log('检查当前时间内是否有预约单', resultData);
        let dateStr = formatDate(new Date(), 'YYYY年MM月DD日');
        if (resultData && resultData.orderIdStr) {
          this.checkOrderStatus(resultData);
        }
      },
      noSuccess: (res) => {
        this.setData({
          hidden: true,
        });
      },
    });
  },

  // 检查当前预约单 是否为待就诊(待就诊才提示去问诊)
  checkOrderStatus(orderData) {
    Request.request({
      url: oldServsers + '/order/api/order/detail',
      method: "GET",
      data: {
        orderId: orderData.orderIdStr
      },
      success: (res) => {
        let resultData = res.result;
        console.log('检查当前预约单状态', resultData);
        let dateStr = formatDate(new Date(), 'YYYY年MM月DD日');
        let checkedOrderId = wx.getStorageSync('checkedOrderId') || '';
        console.log('哈哈哈哈校验弹窗', checkedOrderId, orderData)
        // 如果当前预约单状态为待接诊 且 缓存中的orderid和当前预约单id不一致 弹窗提示去就诊
        if (resultData.status == 1 && checkedOrderId != orderData.orderIdStr) {
          wx.removeStorageSync('checkedOrderId');
          wx.setStorageSync('checkedOrderId', orderData.orderIdStr);
          wx.showModal({
            title: '温馨提示',
            content: `您有一个预约问诊，就诊人：${resultData.patientName},就诊时间${dateStr}${orderData.startDateStr}-${orderData.endDateStr}，请准时就诊`,
            cancelText: '取消',
            confirmText: '立即问诊',
            success: (res) => {
              console.log('立即问诊');
              if (res.confirm) {
                wx.navigateTo({
                  url: `../interrogationForm/interrogationForm?doctorId=${resultData.doctorId}&orderId=${orderData.orderIdStr}`,
                });
              }
            }
          });
        }
      },
      noSuccess: (res) => {
        this.setData({
          hidden: true,
        });
      },
    });
  },
 

  isFromGaoJi: function (option) {
    const { phone, businessUserId, fromType } = option;
    const that = this;
    let str = '';
    if (fromType == 1) {
      str = 'GaoJiAPP';
    } else {
      str = 'GaoJiWebChatAPP';
    }
    Request.request({
      url: servsers + '/his/api/noauth/verify/user/auth',
      method: "GET",
      data: {
        userId: businessUserId,
        source: str,
        destination: str,
        phoneNo: phone,
      },
      success: function (res) {
        let resultData = res.result;
        that.setData({
          isShowGaojiModal: !resultData,
          gaoJiOpt: option,
        }, () => {
          that.getStoreInfo(option.scene);
        });
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
    });
  },

  gaojiModalClose: function () {
    this.setData({
      isShowGaojiModal: false,
    });
  },

  radioChange: function (e) {
    const { value } = e.detail;
    this.setData({
      gaojiInfoChecked: value,
    });
  },

  agreeGaoji: function () {
    const { gaojiInfoChecked, gaoJiOpt } = this.data;
    const { phone, businessUserId, fromType } = gaoJiOpt;
    const that = this;
    let str = '';
    if (fromType == 1) {
      str = 'GaoJiAPP';
    } else {
      str = 'GaoJiWebChatAPP';
    }
    if (!gaojiInfoChecked) {
      return;
    }
    Request.request({
      url: servsers + '/his/api/noauth/user/add/auth',
      method: "POST",
      data: {
        phoneNo: phone,
        userId: businessUserId,
        source: str,
        destination: str,
      },
      success: function (res) {
        let resultData = res.result;
        that.gaojiModalClose();
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
    });
  },

  getAccountStatus: function () {
    const that = this;
    Request.request({
      url: oldServsers + '/uaa/api/user/getStatus',
      method: "GET",
      data: {},
      success: function (res) {
        let resultData = res.result;
        app.globalData.isShowAccount = resultData.subStatus !== 1;
        that.setData({
          isShowAccount: resultData.subStatus !== 1,
        });
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
    });
  },

  attached() {
    const that = this;
    app.setWatching('globalAhead', v => {
      const firstRouter = getFirstRoute();
      if (firstRouter != 'pages/home/home') {
        return;
      }
      const globalAhead = app.globalData.___globalAhead;
      if (globalAhead == 0) {
        that.setData({
          dialogButtons: [{ text: '挂断' }, { text: '开始问诊' }],
          dialogShow: true,
          dialogTitle: '排队到号通知',
          dialogContent: '您发起的问诊已到号，请点击【开始问诊】按钮与医生对话'
        });
      }
    });
    app.setWatching('showDoctorRefuse', v => {
      const firstRouter = getFirstRoute();
      if (firstRouter != 'pages/home/home') {
        return;
      }
      const showDoctorRefuse = app.globalData.___showDoctorRefuse;
      if (showDoctorRefuse) {
        that.setData({
          dialogButtons: [{ text: '知道了' }],
          dialogShow: true,
          dialogTitle: '问诊提示',
          dialogContent: '医生忙碌中暂时无法接诊，请您选择其他医生问诊'
        });
      }
    });
    app.setWatching('showDoctorOffLine', v => {
      const firstRouter = getFirstRoute();
      if (firstRouter != 'pages/home/home') {
        return;
      }
      const showDoctorOffLine = app.globalData.___showDoctorOffLine;
      if (showDoctorOffLine) {
        that.setData({
          dialogButtons: [{ text: '知道了' }],
          dialogShow: true,
          dialogTitle: '问诊提示',
          dialogContent: '当前排队的医生已下线，请您选择其他医生问诊'
        });
      }
    });
    app.setWatching('globalVideoData', v => {
      const firstRouter = getFirstRoute();
      if (firstRouter != 'pages/home/home') {
        return;
      }
      that.setData({
        dialogButtons: [{ text: '开始问诊' }],
        dialogShow: true,
        dialogTitle: '医生接入通知',
        dialogContent: '您发起的问诊医生已接入，请点击【开始问诊】按钮与医生对话'
      });
    });
  },

  cancelInquiry() {
    let tokenInfo = wx.getStorageSync('tokenInfo') ? wx.getStorageSync('tokenInfo') : {};
    let doctorId = wx.getStorageSync('doctorId') ? wx.getStorageSync('doctorId') : '';
    Request.request({
      url: servsers + '/his/api/outpatient/patientCancelQueue',
      method: 'GET',
      data: {
        doctorId,
        userId: tokenInfo.userId
      },
      success: function ({ result }) {
        wx.showToast({
          title: '挂断成功',
          icon: 'none',
        })
      },
      noSuccess: function () {

      }
    });
  },

  // 链接socket
  connetWS() {
    const that = this;
    if (this.data.storeAndBusinessInfo && this.data.storeAndBusinessInfo.businessId) {
      if (app.globalData.doctorListWS) {
        app.globalData.doctorListWS.close();
      }
      let ws = new WebSocket();
      const src = `/user/${this.data.storeAndBusinessInfo.businessId}/message`;
      ws.buildConnectAndMonitor({}, wssServsers, src, function (message) {
        const wsResult = JSON.parse(message.body);
        console.log('首页监听医生状态的ws消息', src, wsResult.type, wsResult.data);
        app.websocketListener(wsResult.type, JSON.stringify(wsResult.data));
        if (wsResult.type === 'patient_refresh_doctor_list') {
          that.getDoctorList();
        }
      }, function (result) {
        console.log('首页医生状态ws重连', result);
      });
      app.globalData.doctorListWS = ws;
    }
  },

  getStoreInfo(storeId) {
    const storeInfo = wx.getStorageSync('storeAndBusinessInfo') ? wx.getStorageSync('storeAndBusinessInfo') : {};
    const that = this;
    let id = '';
    // 如果路径上有storeId 取路径上为准 反之取缓存中门店id
    if (storeId) {
      id = storeId;
    } else {
      id = storeInfo.storeId || '';
    }
    console.log('哈哈哈哈首页storeId', id);
    // 不在提示必须扫码进入 没有门店 服务端会默认给一个虚拟门店
    if (!id) {
      // that.setData({
      //   otherWayEnter: true,
      // });
      app.globalData.otherWayEnter = true;
    } else {
      app.globalData.otherWayEnter = false;
    }
    that.getStoreInfoById(id);
  },

  getStoreInfoById(id) {
    const that = this;
    // 请求接口 然后根据返回值 前端存储门店信息 或者 显示提醒扫码图片
    const completeUser = wx.getStorageSync('completeUser') || '0';
    Request.request({
      url: servsers + '/his/api/noauth/getNameByStoreId',
      method: "GET",
      data: {
        storeId: id,
      },
      success: function (res) {
        let resultData = res.result;
        wx.setStorageSync('storeAndBusinessInfo', resultData)
        that.setData({
          storeAndBusinessInfo: resultData,
        }, () => {
          that.connetWS();
          that.getBannerInfo();
          that.getShareConfig();
          // console.log('新手引导', resultData.storeId, userHelpStoreIds.indexOf(resultData.storeId))
          // if (userHelpStoreIds.indexOf(resultData.storeId) > -1 && Number(completeUser) == 0 ) {
          //   // 特定门店下 且 完成 或者 主动跳过 引导时  不再去往引导落地页 反之 跳转到引导落地页
          //   wx.redirectTo({
          //     url: '../userHelpHome/userHelpHome',
          //   })
          // }
        });
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
          otherWayEnter: true,
        });
      },
    });
  },

  getBannerInfo() {
    const that = this;
    const { storeAndBusinessInfo } = this.data;
    Request.request({
      url: oldServsers + '/forest/api/noauth/v2/list',
      method: "GET",
      data: {
        businessId: app.globalData.businessId,
        type: 8,
        bannerType: 1,
        limit: 5,
        sort: 0,
      },
      success: function (res) {
        let resultData = res.result || [];
        if (!resultData.length) {
          resultData.push({
            path: "https://gjscrm-1256038144.cos.ap-beijing.myqcloud.com/common/1565062287463/defaultBanner.jpg",
          });
          // 瑞澄专用banner
          // if (storeAndBusinessInfo.businessId == 72613) {
          //   resultData.push({
          //     // path: "https://gj-prod-1256038144.cos.ap-beijing.myqcloud.com/common/1580465132303/banner.jpg",
          //     path: "https://gjscrm-1256038144.cos.ap-beijing.myqcloud.com/common/1580793921343/banner.jpg",
          //   });
          // } else {
          //   resultData.push({
          //     path: "https://gjscrm-1256038144.cos.ap-beijing.myqcloud.com/common/1565062287463/defaultBanner.jpg",
          //   });
          // }
        }
        that.setData({
          imgUrls: resultData,
        }, () => {
          that.getDoctorList();
        });
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
    });
  },

  changeNav(e) {
    const that = this;
    const { itemid, idx } = e.currentTarget.dataset;
    let { laboratoryId } = this.data;
    if (itemid != laboratoryId) {
      const doctorDataList = this.getDoctorListByLabId(itemid);
      const query = wx.createSelectorQuery().in(this);
      query.selectAll('.navItem').boundingClientRect((rect) => {
        let width = 0;
        for (let i = 0; i < idx; i++) {
          width += rect[i].width
        }
        //大于屏幕一半的宽度则滚动
        let clientWidth = wx.getSystemInfoSync().windowWidth / 2;
        if (width > clientWidth) {
          that.setData({
            laboratoryId: itemid,
            doctorDataList,
            scrollLeft: width + rect[idx].width / 2 - clientWidth
          })
        } else {
          that.setData({
            laboratoryId: itemid,
            doctorDataList,
            scrollLeft: 0
          })
        }
      }).exec()
    }
  },

  getDoctorList() {
    const that = this;
    const { storeAndBusinessInfo, laboratoryId } = this.data;
    const tokenInfo = wx.getStorageSync('tokenInfo') || {};
    Request.request({
      url: servsers + '/his/api/noauth/doctor/chooseOnlineDoctorList/v2',
      method: "POST",
      data: {
        laboratoryId, // 科室
        businessId: storeAndBusinessInfo.businessId,
        storeId: storeAndBusinessInfo.storeId,
        userId: tokenInfo.userId || '',
        source: 2,
        version: 13, // 1.3版本接口兼容
      },
      success: function (res) {
        doctorList = res.result || [];
        that.setData({
          hidden: true,
          laboratoryList: that.getLaboratoryList(doctorList),
          doctorDataList: that.getDoctorListByLabId(laboratoryId)
        })
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
      },
    });
  },

  // 通过医生列表获取科室列表
  getLaboratoryList(list) {
    let laboratoryList = [];
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      laboratoryList.push({
        laboratoryId: item.laboratoryId,
        laboratoryName: item.laboratoryName
      })
    }
    return laboratoryList;
  },

  // 通过科室id获取医生
  getDoctorListByLabId(labId) {
    const that = this;
    for (let i = 0; i < doctorList.length; i++) {
      let item = doctorList[i];
      if (item.laboratoryId == labId) {
        return item.list.slice(0, 150);
      }
    }
    return [];
  },

  onPageScroll(e) {
    let scrollTop = e.scrollTop;
    this.setData({
      scrollTop
    })
  },

  // banner点击
  goToWebView(e) {
    const { swiperitem } = e.currentTarget.dataset
    if (swiperitem.fowardType === 1) {
      wx.navigateTo({
        url: `../webView/webView?src=${encodeURIComponent(swiperitem.fowardContent)}`,
      });
    }
  },

  closeOtherWayModal() {
    this.setData({
      otherWayEnter: false,
    });
  },

  // 问诊码
  scanCode() {
    const that = this;
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        if (!res.path) {
          wx.showToast({
            title: '二维码非正常问诊码，请确认后重试',
            icon: 'none'
          });
          return;
        } else {
          const storeId = getUrlParam(res.path, 'scene');
          that.getStoreInfo(storeId);
        }
      }
    })
  },

  // 授权子组件回调
  authBack: function (e) {
    const that = this;
    this.setData({
      isLogin: e.detail.isLogin,
      isMemberFlag: e.detail.isMemberFlag,
    }, () => {
      switch (e.detail.type) {
        case '1':
          // 视频问诊快速问诊
          that.quickAction();
          break
        case '2':
          // 我的处方
          that.goToMyOrders();
          break
        case '3':
          // 医生详情
          that.goToDoctorDetail();
          break
        case '4':
          // 立即问诊
          that.authNowAction();
          break
        case '5':
          // 问诊记录
          that.goToRecord();
          break
        case '6':
          // 图文问诊快速问诊
          that.imgQuick();
          break
        case '7':
          console.log('分享前需授权');
          break;
        default:
          that.quickAction();
      }
      if (e.detail.isLogin && e.detail.isMemberFlag) {
        app.beginWs();
        this.getAccountStatus();
      }
    });
  },

  goToRecord() {
    const that = this;
    if (!this.data.isLogin) {
      return;
    }
    if (this.data.isMemberFlag) {
      wx.navigateTo({
        url: '../inquiryRecord/inquiryRecord',
      });
    } else {
      wx.navigateTo({
        url: '../registerPage/registerPage',
      });
    }
  },

  imgQuick() {
    if (!this.data.isLogin) {
      return;
    }
    const storeInfo = wx.getStorageSync('storeAndBusinessInfo') ? wx.getStorageSync('storeAndBusinessInfo') : {};
    Request.request({
      url: servsers + '/his/api/storeDoctorExtend/getStoreInfo',
      method: 'POST',
      data: {
        storeId: storeInfo.storeId,
        businessId: storeInfo.businessId
      },
      success: ({ result }) => {
        this.setData({
          dialogType: '2',
          selectDocId: '',
          doctorinfo: null,
          freeDoctor: result && result.onlyDisplayExpertFlag === 1,
          homeVideoFlag:'trues',
        }, () => {
          if (this.data.isMemberFlag) {
            this.setData({
              typeModal: false,
              interrogationType:'0',
            }, () => {
              // 1视频问诊 2 是图文问诊 判断是否有该问诊方式的医生在线 或者医生明确时 判断医生是否在线
              this.inquiryDoctor(2);
            });
          } else {
            wx.setStorageSync('homeJoin', 1);
            wx.navigateTo({
              url: `../registerPage/registerPage`,
            });
          }
        })
      }
    });
  },
  // 弹框回调
  selectTypeBack(data) {
    console.log('selectTypeBack 选择问诊方式回调', data.detail);
    const { dialogType, interrogationType } = data.detail;
    this.setData({
      typeModal: false,
      interrogationType,
    }, () => {
      // 1视频问诊 2 是图文问诊 判断是否有该问诊方式的医生在线 或者医生明确时 判断医生是否在线
      this.inquiryDoctor();
    });
  },

  // 判断是否有该问诊方式的医生在线 或者医生明确时 判断医生是否在线
  inquiryDoctor(type) {
    const { freeDoctor } = this.data;
    const { selectDocId, dialogType, interrogationType, doctorinfo, homeVideoFlag } = this.data;
    const tokenInfo = wx.getStorageSync('tokenInfo') || {};
    const that = this;
    const storeInfo = wx.getStorageSync('storeAndBusinessInfo') ? wx.getStorageSync('storeAndBusinessInfo') : {};
    console.log('inquiryDoctor', type, dialogType, fixDialogType(dialogType), interrogationType);
    Request.request({
      url: servsers + '/his/api/webrtc/checkAvailableDoctor',
      method: 'POST',
      data: {
        doctorId: selectDocId,
        userId: tokenInfo.userId,
        doctorServiceId: fixDialogType(dialogType),
        inquirySource: 2, // 0 pc 1 高济健康app 2 小程序
        storeId: storeInfo.storeId,
        businessId: storeInfo.businessId,
      },
      success: function ({ result }) {
        console.log('判断是否有该问诊方式的医生在线 准备跳转',doctorinfo);
        // 瑞澄义诊不选择问诊方式 默认病症咨询 到家问诊 也不选择 默认走病症咨询 轻问诊医生同上
        if (freeDoctor || storeInfo.daojiaSpecialFlag == 0 || (doctorinfo && doctorinfo.doctorFlag === 1)) {
          wx.navigateTo({
            url: `../addDrugs/addDrugs?doctorName=${doctorinfo?doctorinfo.realName:''}&doctorId=${selectDocId}&interrogationType=${interrogationType}&dialogType=${dialogType}`,
          });
          // wx.navigateTo({
          //   url: `../selectPatient/selectPatient?doctorId=${selectDocId}&interrogationType=${interrogationType}&dialogType=${dialogType}`,
          // });
        } else {
          if (that.data.isMemberFlag == true) {
            wx.navigateTo({
              url: `../addDrugs/addDrugs?doctorName=${doctorinfo?doctorinfo.realName:''}&doctorId=${selectDocId}&interrogationType=${interrogationType}&dialogType=${dialogType}&homeVideoFlag=${homeVideoFlag}`,
            });
          } else {
            wx.navigateTo({
                url: `../home/home`,
            });
          }
            // wx.navigateTo({
            //   url: `../home/home`,
            // });
            // wx.navigateTo({
            //   url: `../selectPatient/selectPatient?doctorId=${selectDocId}&interrogationType=${interrogationType}&dialogType=${dialogType}`,
            // });
          
        }
      }
    });
  },

  // 视频快速问诊
  quickAction() {
    const that = this;
    const { storeAndBusinessInfo } = this.data;
    const tokenInfo = wx.getStorageSync('tokenInfo');
    if (!this.data.isLogin) {
      return;
    }
    this.setData({
      dialogType: '1',
      selectDocId: '',
      doctorinfo: null,
      homeVideoFlag:false,
    }, () => {
      // 从首页点击视频问诊分配医生
      if (this.data.isMemberFlag) {
        this.chooseValidate();
      } else {
        wx.navigateTo({
          url: '../registerPage/registerPage',
        });
      }
    })
  },

  // 开方拿药系统分配医生
  chooseValidate() {
    const that = this;
    const { storeAndBusinessInfo } = this.data;
    const tokenInfo = wx.getStorageSync('tokenInfo') || {};
    Request.request({
      url: servsers + '/his/api/webrtc/quick/choose-validate',
      method: "GET",
      data: {
        businessId: storeAndBusinessInfo.businessId,
        storeId: storeAndBusinessInfo.storeId,
        userId: tokenInfo.userId,
        doctorServiceId: 2,
      },
      showToast: false,
      success: function (res) {
        let resultData = res.result;
        // 只有中医科医生
        if (resultData.onlyHasChinse) {
          wx.showModal({
            title: '问诊提示',
            content: '目前只有中医科医生在线,是否继续问诊?',
            cancelText: '取消问诊',
            confirmText: '继续问诊',
            success(res) {
              if (res.confirm) {
                that.setData({
                  selectDocId: resultData.doctorId,
                }, () => {
                  that.getInquiryUserStatus(resultData.doctorId);
                });
              }
            }
          });
        } else {
          that.setData({
            selectDocId: resultData.doctorId,
            freeDoctor: resultData.laboratoryId == 9,
          }, () => {
            that.getInquiryUserStatus(resultData.doctorId);
          });
        }
      },
      noSuccess: function (res) {
        that.setData({
          hidden: true,
        });
      },
    });
  },

  // 我的处方
  goToMyOrders() {
    const that = this;
    if (!this.data.isLogin) {
      return;
    }
    if (this.data.isMemberFlag) {
      wx.navigateTo({
        url: '../myPrescription/myPrescription?type=1',
      });
    } else {
      wx.navigateTo({
        url: '../registerPage/registerPage',
      });
    }
  },

  // 医生详情
  goToDoctorDetail(e) {
    const that = this;
    const id = e ? e.currentTarget.dataset.id : this.data.currentDoctorId;
    const detail = e ? e.currentTarget.dataset.detail : this.data.doctorDetail;
    if (!this.data.isLogin) {
      this.setData({
        currentDoctorId: id,
        doctorDetail: detail,
      });
      return;
    }
    // 主诊医生下线时  不允许进入医生详情页
    if (detail.mainDoctorFlag == 1 && detail.latestStatus == 0) {
      wx.showToast({
        title: '主诊医生暂未上线，您可咨询平台其他医生',
        icon: 'none',
      })
      return;
    }
    wx.navigateTo({
      url: `../doctorDetail/doctorDetail?doctorId=${id}`,
    });
  },

  // 查看用户的问诊状态  requestEntry： 0 首页开方拿药  1 首页选择医生问诊 2 排队页跳转视频页
  getInquiryUserStatus(docId) {
    const that = this;
    const tokenInfo = wx.getStorageSync('tokenInfo') || {};
    const { doctorinfo } = that.data;
    console.log('getInquiryUserStatus', docId, doctorinfo);
    this.setData({
      hidden: false,
    });
    let doctorServiceId = 2;
    // docId 代表医生在线
    if (docId && doctorinfo) {
      doctorServiceId = doctorinfo.doctorServiceIds.length ? doctorinfo.doctorServiceIds[0] : 2;
    }
    Request.request({
      url: servsers + '/his/api/webrtc/getInquiryUserStatus',
      method: "POST",
      data: {
        requestEntry: docId ? 1 : 0,
        userId: tokenInfo.userId,
        doctorId: docId,
        doctorServiceId,
      },
      success: function (res) {
        that.setData({
          hidden: true,
        });
        const { doctorId, doctorStatus, inQueue, sameDoctor, doctorRealName, hangUpUser, tips, idx, messageVO } = res.result;
        if (doctorStatus === 0) {
          wx.showToast({
            title: '医生已下线',
            icon: 'none'
          })
          return;
        }
        // 用户不在队列，正常问诊
        if (!inQueue) {
          if (doctorStatus === 4) {
            wx.showToast({
              title: '该医生暂停接诊，请选择其他医生问诊',
              icon: 'none'
            });
            return;
          }
          // 立即问诊 视频问诊 
          that.inquiryDoctor(1);
          // docId存在表示点击医生， 不存在表示点击开方拿药
          return;
        }

        // 点击开方拿药
        if (!docId) {
          // 有正在排队的问诊 不是排在第一位弹窗提示，排在第一位就直接进
          if (idx !== 0) {
            wx.showModal({
              title: '温馨提示',
              content: `当前正在排【${doctorRealName}】医生号，请结束后再开启新的问诊`,
              cancelText: '取消排队',
              confirmText: '继续排队',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../videoDiagnosis/videoDiagnosis',
                  })
                } else if (res.cancel) {
                  that.cancelQueue(doctorId);
                }
              }
            })
          } else {
            // 上次问诊 用户主动挂断  医生正在开具处方
            if (hangUpUser) {
              wx.showToast({
                title: `上次问诊【${doctorRealName}】医生正在开具处方，请稍后问诊`,
                icon: 'none'
              })
              return;
            }
            wx.navigateTo({
              url: '../videoDiagnosis/videoDiagnosis',
            })
          }
          return;
        }

        // 非开方拿药 用户在队列，且问的是同一个医生
        if (sameDoctor) {
          // 不是排在第一个
          // if (idx !== 0) {
          //   wx.navigateTo({
          //     url: '../videoDiagnosis/videoDiagnosis',
          //   })
          //   return;
          // }
          // 主动挂断
          if (hangUpUser) {
            wx.showToast({
              title: `上次问诊【${doctorRealName}】医生正在开具处方，请稍后问诊`,
              icon: 'none'
            })
            return;
          }
          wx.navigateTo({
            url: '../videoDiagnosis/videoDiagnosis',
          })
        } else {
          // 不是排在第一个
          if (idx !== 0) {
            wx.showModal({
              title: '温馨提示',
              content: `当前正在排【${doctorRealName}】医生号，请结束后再开启新的问诊`,
              cancelText: '取消排队',
              confirmText: '继续排队',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../videoDiagnosis/videoDiagnosis',
                  })
                } else if (res.cancel) {
                  that.cancelQueue(doctorId);
                }
              }
            })
            return;
          }
          // 用户挂断
          if (hangUpUser) {
            wx.showToast({
              title: `上次问诊【${doctorRealName}】医生正在开具处方，请稍后问诊`,
              icon: 'none'
            })
            return;
          }
          wx.setStorageSync('doctorId', doctorId);
          wx.showModal({
            title: '温馨提示',
            content: `当前正在问诊【${doctorRealName}】医生`,
            confirmText: '继续问诊',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../videoDiagnosis/videoDiagnosis',
                })
              }
            }
          })
        }
      },
    })
  },

  // 立即问诊
  nowAction(e) {
    const that = this;
    const { doctorinfo } = e.currentTarget.dataset;
    const doctorServiceId = doctorinfo.doctorServiceIds[0];
    console.log('nowAction')

    this.setData({
      doctorinfo,
      freeDoctor: doctorinfo.laboratoryId == 9,
      selectDocId: doctorinfo.doctorId,
      dialogType: doctorServiceId === 2 ? '1' : '2',
      interrogationType: doctorinfo.doctorFlag == 1 ? '1' : '0',
      homeVideoFlag:true
    }, () => {
      if (!this.data.isLogin) {
        return;
      }
      console.log('nowAction', doctorinfo);
      if (doctorinfo.latestStatus == 0) {
        return;
      }
      if (doctorinfo.latestStatus == 4) {
        wx.showToast({
          title: '该医生已暂停接诊，请选择其他医生问诊',
          icon: 'none'
        });
        return;
      }
      if (!this.data.isMemberFlag) {
        wx.navigateTo({
          url: '../registerPage/registerPage',
        });
      } else if (doctorinfo.tag == 3) {
        // tag 1 2 3  1 是预约医生 但是今天未排班 可以正常问诊  2 是普通医生 3 是预约医生 且今天有排班 需要走排班校验
        this.quiryOrderDoctor(doctorinfo);
      } else if (doctorServiceId == 2) {
        this.getInquiryUserStatus(doctorinfo.doctorId);
      } else {
        this.inquiryDoctor(1);
      }
    });
  },

  authNowAction() {
    const { doctorinfo, isMemberFlag } = this.data;
    const that = this;
    const doctorServiceId = doctorinfo.doctorServiceIds[0];
    this.setData({
      dialogType: doctorServiceId === 2 ? '1' : '2',
      selectDocId: doctorinfo.doctorId,
    }, () => {
      if (!this.data.isMemberFlag) {
        wx.navigateTo({
          url: '../registerPage/registerPage',
        });
      } else if (doctorinfo.tag == 3) {
        // tag == 3代表是预约医生 且 今天有预约排班 需要校验
        this.quiryOrderDoctor(doctorinfo);
      } else if (doctorServiceId == 2) {
        this.getInquiryUserStatus(doctorinfo.doctorId);
      } else {
        this.inquiryDoctor(1);
      }
    });
  },

  // 校验预约医生
  quiryOrderDoctor(data) {
    const tokenInfo = wx.getStorageSync('tokenInfo') || {};
    Request.request({
      url: servsers + '/his/api/reserveUser/isReserve',
      method: 'POST',
      data: {
        doctorId: data.doctorId,
        hospitalId: data.hospitalId,
        userId: tokenInfo.userId,
      },
      success: function ({ result }) {
        console.log('quiryOrderDoctor', result);
        if (result.code == '3') {
          wx.navigateTo({
            url: `../interrogationForm/interrogationForm?orderId=${result.value}&doctorId=${data.doctorId}`,
          })
        } else {
          wx.showToast({
            title: result.value,
            icon: 'none'
          })
        }
      }
    });
  },

  closeEvent() {
    this.setData({
      typeModal: false,
    });
  },

  accountErr: function (e) {
    if (e && e.type === 'error') {
      errorLog('wxAccount', JSON.stringify({
        msg: e.detail
      }), 'INFO');
      this.setData({
        isShowAccount: false,
      });
    }
  },

  // 显示引导收藏弹窗
  showAddDetail: function () {
    this.setData({
      detailModal: true,
      isShowAddToMy: false,
    });
  },

  // 隐藏引导弹窗
  hideAddDetail: function () {
    this.setData({
      detailModal: false,
      isShowAddToMy: true,
    });
  },

  // 取消排队
  cancelQueue(doctorId) {
    const { userId } = wx.getStorageSync('tokenInfo');
    Request.request({
      url: servsers + '/his/api/outpatient/patientCancelQueue',
      method: 'GET',
      data: {
        doctorId,
        userId
      },
      success: function ({ result }) {
        if (result) {
          wx.showToast({
            icon: 'none',
            title: '取消排队成功',
          });
        }
      }
    });
  },

  // 自定义弹框按钮点击
  tapDialogButtons(e) {
    const that = this;
    let { index, item } = e.detail;
    that.setData({
      dialogShow: false
    }, () => {
      if (item.text == '挂断') {
        that.cancelInquiry();
      } else if (item.text == '开始问诊') {
        wx.navigateTo({
          url: '../videoDiagnosis/videoDiagnosis',
        })
      }
    })
  },

  // 跳转条款页
  routerGo: function (e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: type == 1 ? '../privacyAgree/privacyAgree' : '../agreement/agreement'
    });
  },

  // 分享图片
  setShareImg(res) {
    console.log('首页设置分享图片', res.detail);
    this.setData({
      shareImg: res.detail,
    })
  },

});