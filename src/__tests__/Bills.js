/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { prettyDOM } from "@testing-library/dom";

import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import Router from "../app/Router";

import { localStorageMock } from "../__mocks__/localStorage.js"
import store from "../__mocks__/store"
import { formatDate } from "../app/format.js"

global.console = {
  log: jest.fn(),
}

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // construct DOM interface
    beforeEach(() => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      });
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // Routing variable
      window.location.assign(ROUTES_PATH['Bills']);
      document.body.innerHTML = `<div id="root"></div>`;

      // Router init to get actives CSS classes
      await Router();
 
      // "icon-window" must contain the class "active-icon"
      expect(screen.getByTestId("icon-window")).toHaveClass('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByTestId("date").map((e) => e.innerHTML);

      const dateExpected = [
        formatDate(bills[0].date), // '4 Avr. 04'
        formatDate(bills[1].date), // '3 Mar. 03'
        formatDate(bills[2].date), // '2 Fév. 02'
        formatDate(bills[3].date), // '1 Jan. 01'
      ];

      // dates must be equal to datesSorted
      expect(dates).toEqual(dateExpected);
    })
    test("Then 4 bills should be listed", () => {

      const listOFBill = screen.getAllByTestId('bill');
      
      // bill must be the number of 4 and not 5
      expect(listOFBill).toHaveLength(4);
      expect(listOFBill).not.toHaveLength(5);
    })
  })
})

// handleClickNewBill for container/Bills.js
describe('When I click on new bill button', () => {
  test('Then, it should render NewBill page', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    }
    // build user interface
    const html = BillsUI({ data: bills[0]});
    document.body.innerHTML = html;
    //console.log(html);
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    
    // Init Bills
    const contentBill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })

    // Mock handleClickNewBill
    const handleClickNewBill = jest.fn(() => contentBill.handleClickNewBill); 
    
    // Add event
    const btnNewBill = screen.getByTestId('btn-new-bill');
    btnNewBill.addEventListener('click', handleClickNewBill);
    userEvent.click(btnNewBill)

    // screen should called handleClickNewBill, and display new bill form
    expect(handleClickNewBill).toHaveBeenCalled();
    expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
  })
});

describe('When I click on eye icon', () => {
  test('Then it should open the bill modal with corresponding content', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    };

    // build user interface
    const html = BillsUI({ data: bills });
    document.body.innerHTML = html;

    // Init Bills
    const contentBill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    });

    // Mock modal comportment
    $.fn.modal = jest.fn();

    // Get button eye in DOM
    const eye = screen.getAllByTestId('icon-eye')[0];
    const handleClickIconEye = jest.fn((e) => contentBill.handleClickIconEye(eye)); 

    // Add event and click
    eye.addEventListener('click', handleClickIconEye);
    userEvent.click(eye);

    // handleClickIconEye function must be called
    expect(handleClickIconEye).toHaveBeenCalled();
    
    const modale = document.getElementById('modaleFile');
    const billUrl = eye.getAttribute('data-bill-url').split('?')[0];
    expect(modale).toBeTruthy()
    expect(modale.innerHTML.includes(billUrl)).toBeTruthy();
    expect(screen.getAllByText('Justificatif')).toBeTruthy();
  })
})

describe('When I am on Bills page but it is loading', () => {
  test('Then, Loading page should be rendered', () => {
    const html = BillsUI({ loading: true })
    document.body.innerHTML = html
    expect(screen.getAllByText('Loading...')).toBeTruthy()
  })
})

describe('When I am on Bills page but back-end send an error message', () => {
  test('Then, Error page should be rendered', () => {
    const html = BillsUI({ error: 'some error message' })
    document.body.innerHTML = html
    expect(screen.getAllByText('Erreur')).toBeTruthy()
  })
})

// test d'intégration GET Bills
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(store, "get")
       // Get bills and the new bill
       const bills = await store.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       // The number of bills must be 4
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      // user interface BillsUi with error code
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      // waiting for the error message 400
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      store.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      // user interface BillsUi with error code
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      // waiting for the error message 500
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})