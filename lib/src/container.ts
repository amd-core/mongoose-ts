import { Container } from 'typedi';

export function registerService(service: Function): void {
  Container.set({
    type: service
  });
}
