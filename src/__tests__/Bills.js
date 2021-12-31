/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'

import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import store from "../__mocks__/store"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // const html = BillsUI({ data: []})
      // document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        pathname = ROUTES_PATH['Bills']
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const containerBills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      console.log(containerBills)
      
      //console.log(html)
      expect(screen.getByTestId('icon-window')).toHaveClass('active-icon');




      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // const user = JSON.stringify({
      //   type: 'Employee'
      // })
      // window.localStorage.setItem('user', user)
      // //console.log(user)

      // const data = []
      // const loading = false
      // const error = null
      
      // const pathname = ROUTES_PATH['Bills']
      // const html = ROUTES({
      //   pathname,
      //   data,
      //   loading,
      //   error
      // })
      // document.body.innerHTML = html
      // console.log(html)

      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }
      // const containerBills = new Bills({
      //   document, onNavigate, store: null, localStorage: window.localStorage
      // })
      // const html = BillsUI({ data: bills })
      // document.body.innerHTML = html

      // to-do write expect expression
      // expect(screen.getByTestId('icon-window')).toHaveClass('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      // construct user interface
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      // console.log(html)
      // Get text from HTML
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // dates must be equal to datesSorted
      expect(dates).toEqual(datesSorted)
    })
  })
})